import "server-only";

export interface GitHubRepoIdentifier {
  owner: string;
  repo: string;
}

export function parseRepoFullName(fullName: string): GitHubRepoIdentifier {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid repository full name: ${fullName}`);
  }
  return { owner, repo };
}
