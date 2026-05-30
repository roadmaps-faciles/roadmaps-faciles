// @ts-check

/**
 * Gate CI avant build/push de l'image Docker sur un tag de release.
 *
 * Vérifie que les workflows Build / Lint / Tests sont verts sur le commit pointé
 * par le tag courant. Poll jusqu'à complétion (release-please peut créer le tag
 * pendant que la CI du push `main` tourne encore), échoue si l'un d'eux fail ou
 * si le délai est dépassé.
 *
 * Appelé via actions/github-script :
 *   const gate = require('./.github/scripts/ci-gate-release.js');
 *   await gate({ github, context, core });
 *
 * @typedef {ReturnType<import("@actions/github").getOctokit>} GitHub
 * @typedef {typeof import("@actions/github").context} Context
 * @typedef {import("@actions/core")} Core
 */

const CI_WORKFLOWS = [
  { name: "Build", file: "build.yml" },
  { name: "Lint", file: "lint.yml" },
  { name: "Tests", file: "test.yml" },
];

const TERMINAL_FAIL = ["failure", "cancelled", "timed_out", "startup_failure"];
const DEADLINE_MS = 15 * 60 * 1000;
const POLL_MS = 30 * 1000;

const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Résout un tag (lightweight ou annoté) vers le commit sous-jacent.
 *
 * @param {GitHub} github
 * @param {string} owner
 * @param {string} repo
 * @param {string} tag
 * @returns {Promise<string>}
 */
async function resolveTagToCommit(github, owner, repo, tag) {
  const { data: refData } = await github.rest.git.getRef({ owner, repo, ref: `tags/${tag}` });
  if (refData.object.type === "tag") {
    const { data: tagData } = await github.rest.git.getTag({ owner, repo, tag_sha: refData.object.sha });
    return tagData.object.sha;
  }
  return refData.object.sha;
}

/**
 * @param {object} params
 * @param {GitHub} params.github
 * @param {Context} params.context
 * @param {Core} params.core
 */
module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  const tag = context.ref.replace("refs/tags/", "");

  const commitSha = await resolveTagToCommit(github, owner, repo, tag);
  core.info(`Tag ${tag} -> commit ${commitSha}`);

  const pending = new Set(CI_WORKFLOWS.map((wf) => wf.file));
  const deadline = Date.now() + DEADLINE_MS;

  while (pending.size > 0) {
    for (const wf of CI_WORKFLOWS.filter((w) => pending.has(w.file))) {
      const { data } = await github.rest.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: wf.file,
        head_sha: commitSha,
        per_page: 1,
      });
      const run = data.workflow_runs[0];
      if (!run || run.status !== "completed") continue;
      if (TERMINAL_FAIL.includes(run.conclusion ?? "")) {
        core.setFailed(
          `${wf.name} a échoué pour ${commitSha} (${run.conclusion}). Corrige + re-tag, ou relance via workflow_dispatch une fois la CI verte.`,
        );
        return;
      }
      if (run.conclusion === "success") pending.delete(wf.file);
    }

    if (pending.size === 0) break;
    if (Date.now() > deadline) {
      core.setFailed(`Timeout (15 min) : CI pas terminée pour ${commitSha}. En attente : ${[...pending].join(", ")}.`);
      return;
    }
    core.info(`En attente de : ${[...pending].join(", ")}...`);
    await sleep(POLL_MS);
  }

  core.info("CI verte sur le commit taggé, build autorisé.");
};
