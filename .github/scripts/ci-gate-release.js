// @ts-check

/**
 * @typedef {ReturnType<import("@actions/github").getOctokit>} GitHub
 * @typedef {typeof import("@actions/github").context} Context
 * @typedef {import("@actions/core")} Core
 */

const CI_WORKFLOWS = [
  { name: "Build", file: "build.yml" },
  { name: "Lint", file: "lint.yml" },
  { name: "Tests", file: "test.yml" },
];

/**
 * Resolve a git tag to its underlying commit SHA.
 * Handles both lightweight and annotated tags.
 *
 * @param {GitHub} github
 * @param {string} owner
 * @param {string} repo
 * @param {string} tag
 */
async function resolveTagToCommit(github, owner, repo, tag) {
  const { data: refData } = await github.rest.git.getRef({
    owner,
    repo,
    ref: `tags/${tag}`,
  });

  if (refData.object.type === "tag") {
    const { data: tagData } = await github.rest.git.getTag({
      owner,
      repo,
      tag_sha: refData.object.sha,
    });
    return tagData.object.sha;
  }

  return refData.object.sha;
}

/**
 * @param {object} params
 * @param {GitHub} params.github
 * @param {Context} params.context
 * @param {Core} params.core
 * @param {string} params.tag
 */
module.exports = async ({ github, context, core, tag }) => {
  const { owner, repo } = context.repo;

  const commitSha = await resolveTagToCommit(github, owner, repo, tag);
  core.info(`Tag ${tag} → commit ${commitSha}`);

  for (const wf of CI_WORKFLOWS) {
    const { data } = await github.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: wf.file,
      head_sha: commitSha,
      per_page: 1,
    });

    const run = data.workflow_runs[0];
    if (!run || run.conclusion !== "success") {
      const status = run ? `${run.status}/${run.conclusion}` : "not found";
      core.setFailed(
        `${wf.name} did not pass for commit ${commitSha} (${status}). Retry via workflow_dispatch after CI completes.`,
      );
      return;
    }
    core.info(`${wf.name}: passed`);
  }

  core.info("All CI checks passed for release commit.");
};
