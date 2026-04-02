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

const APPS = {
  production: "roadmaps-faciles",
  staging: "roadmaps-faciles-staging",
};

/**
 * Check that all CI workflows passed for a given commit.
 * Returns true only when every workflow has a completed+success run.
 *
 * @param {GitHub} github
 * @param {string} owner
 * @param {string} repo
 * @param {string} headSha
 * @param {Core} core
 */
async function allCiPassed(github, owner, repo, headSha, core) {
  for (const wf of CI_WORKFLOWS) {
    const { data } = await github.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: wf.file,
      head_sha: headSha,
      per_page: 1,
    });

    const run = data.workflow_runs[0];
    if (!run) {
      core.info(`${wf.name}: no run found yet`);
      return false;
    }

    core.info(`${wf.name}: status=${run.status}, conclusion=${run.conclusion}`);
    if (run.status !== "completed" || run.conclusion !== "success") {
      return false;
    }
  }
  return true;
}

/**
 * @param {object} params
 * @param {GitHub} params.github
 * @param {Context} params.context
 * @param {Core} params.core
 * @param {keyof typeof APPS} params.dispatchEnvironment
 */
module.exports = async ({ github, context, core, dispatchEnvironment }) => {
  const eventName = context.eventName;
  /** @type {keyof typeof APPS} */
  let environment = "staging";
  let ref = context.sha;
  let shouldDeploy = false;

  if (eventName === "workflow_dispatch") {
    environment = dispatchEnvironment;
    ref = context.sha;
    shouldDeploy = true;
    core.info("Manual dispatch — skipping CI gate");
    if (environment === "production") {
      core.warning(`Manual production deploy from ref ${ref} — ensure this is intentional`);
    }
  } else if (eventName === "release") {
    environment = "production";
    ref = context.payload.release.tag_name;
    shouldDeploy = true;
    core.info(`Release published: ${ref}`);
  } else if (eventName === "workflow_run") {
    environment = "staging";
    ref = context.payload.workflow_run.head_sha;

    core.info(`Checking CI status for commit ${ref}`);
    const { owner, repo } = context.repo;
    const passed = await allCiPassed(github, owner, repo, ref, core);

    shouldDeploy = passed;
    if (!passed) {
      core.info("Not all CI workflows passed yet — skipping. Next workflow_run event will re-check.");
    }
  }

  const appName = APPS[environment] ?? APPS.staging;

  core.setOutput("environment", environment);
  core.setOutput("app_name", appName);
  core.setOutput("ref", ref);
  core.setOutput("should_deploy", String(shouldDeploy));

  core.summary
    .addHeading("Deploy Resolution", 3)
    .addTable([
      [
        { data: "Field", header: true },
        { data: "Value", header: true },
      ],
      ["Environment", environment],
      ["App", appName],
      ["Ref", ref],
      ["Should deploy", String(shouldDeploy)],
    ])
    .write();
};
