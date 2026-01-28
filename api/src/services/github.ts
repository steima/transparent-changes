import { GitDiff, CommitInfo, FileDiff } from "./changelog-generator.js";

export interface GitHubRepository {
    owner: string;
    repo: string;
}

export interface GitHubTag {
    name: string;
    sha: string;
    date: string;
}

export class GitHubService {
    private accessToken: string | null = null;

    setAccessToken(token: string): void {
        this.accessToken = token;
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "transparent-changes",
        };

        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    async listTags(repo: GitHubRepository): Promise<GitHubTag[]> {
        const response = await fetch(
            `https://api.github.com/repos/${repo.owner}/${repo.repo}/tags`,
            { headers: this.getHeaders() }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const tags = (await response.json()) as Array<{
            name: string;
            commit: { sha: string };
        }>;

        return tags.map((tag) => ({
            name: tag.name,
            sha: tag.commit.sha,
            date: "", // Tags don't have dates directly, would need additional API call
        }));
    }

    async getCompare(
        repo: GitHubRepository,
        base: string,
        head: string
    ): Promise<GitDiff> {
        const response = await fetch(
            `https://api.github.com/repos/${repo.owner}/${repo.repo}/compare/${base}...${head}`,
            { headers: this.getHeaders() }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = (await response.json()) as {
            commits: Array<{
                sha: string;
                commit: {
                    message: string;
                    author: { name: string; date: string };
                };
            }>;
            files: Array<{
                filename: string;
                additions: number;
                deletions: number;
                patch?: string;
            }>;
        };

        const commits: CommitInfo[] = data.commits.map((c) => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
        }));

        const files: FileDiff[] = data.files.map((f) => ({
            path: f.filename,
            additions: f.additions,
            deletions: f.deletions,
            patch: f.patch,
        }));

        return {
            fromRef: base,
            toRef: head,
            commits,
            files,
        };
    }

    async listRepositories(): Promise<GitHubRepository[]> {
        if (!this.accessToken) {
            throw new Error("Access token required to list repositories");
        }

        const response = await fetch("https://api.github.com/user/repos", {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = (await response.json()) as Array<{
            owner: { login: string };
            name: string;
        }>;

        return repos.map((r) => ({
            owner: r.owner.login,
            repo: r.name,
        }));
    }
}

export const githubService = new GitHubService();
