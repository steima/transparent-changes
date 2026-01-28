import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/index.js";

export interface GitDiff {
    fromRef: string;
    toRef: string;
    commits: CommitInfo[];
    files: FileDiff[];
}

export interface CommitInfo {
    sha: string;
    message: string;
    author: string;
    date: string;
}

export interface FileDiff {
    path: string;
    additions: number;
    deletions: number;
    patch?: string;
}

export interface GeneratedChangelog {
    title: string;
    summary: string;
    sections: ChangelogSection[];
}

export interface ChangelogSection {
    type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
    items: string[];
}

export class ChangelogGeneratorService {
    private client: Anthropic | null = null;

    private getClient(): Anthropic {
        if (!this.client) {
            if (!config.anthropicApiKey) {
                throw new Error("ANTHROPIC_API_KEY is not configured");
            }
            this.client = new Anthropic({ apiKey: config.anthropicApiKey });
        }
        return this.client;
    }

    async generateChangelog(diff: GitDiff): Promise<GeneratedChangelog> {
        const client = this.getClient();

        const prompt = this.buildPrompt(diff);

        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const textContent = response.content.find((c) => c.type === "text");
        if (!textContent || textContent.type !== "text") {
            throw new Error("No text response from AI");
        }

        return this.parseResponse(textContent.text);
    }

    private buildPrompt(diff: GitDiff): string {
        const commitList = diff.commits
            .map((c) => `- ${c.sha.substring(0, 7)}: ${c.message} (${c.author})`)
            .join("\n");

        const fileChanges = diff.files
            .map((f) => `- ${f.path}: +${f.additions}/-${f.deletions}`)
            .join("\n");

        return `You are a changelog generator. Analyze the following git changes and generate a user-friendly changelog.

## Changes from ${diff.fromRef} to ${diff.toRef}

### Commits:
${commitList}

### File Changes:
${fileChanges}

Generate a changelog in the following JSON format:
{
  "title": "Version title or summary",
  "summary": "Brief 1-2 sentence summary of the release",
  "sections": [
    {
      "type": "added|changed|deprecated|removed|fixed|security",
      "items": ["Description of change 1", "Description of change 2"]
    }
  ]
}

Focus on user-facing changes. Group related changes together. Use clear, non-technical language where possible.
Only include sections that have relevant changes. Return only the JSON, no additional text.`;
    }

    private parseResponse(response: string): GeneratedChangelog {
        // Extract JSON from the response (handle potential markdown code blocks)
        let jsonStr = response.trim();
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();

        const parsed = JSON.parse(jsonStr) as GeneratedChangelog;

        // Validate the structure
        if (!parsed.title || !parsed.summary || !Array.isArray(parsed.sections)) {
            throw new Error("Invalid changelog format from AI");
        }

        return parsed;
    }
}

export const changelogGeneratorService = new ChangelogGeneratorService();
