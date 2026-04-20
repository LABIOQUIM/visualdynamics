module.exports = {
  branches: ["main", { name: "next", channel: "beta", prerelease: true }],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "docs", release: false },
          { type: "chore", release: false },
          { type: "ci", release: false },
        ],
      },
    ],
    [
      "semantic-release-replace-plugin",
      {
        replacements: [
          {
            files: [
              "package.json",
              "apps/api/package.json",
              "apps/web/package.json",
            ],
            from: '"version": ".*"', // eslint-disable-line
            to: '"version": "${nextRelease.version}"', // eslint-disable-line
          },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            {
              type: "feat",
              section: ":sparkles: Features",
              hidden: false,
            },
            {
              type: "fix",
              section: ":bug: Fixes",
              hidden: false,
            },
            {
              type: "docs",
              section: ":memo: Documentation",
              hidden: false,
            },
            {
              type: "refactor",
              section: ":zap: Refactorings",
              hidden: false,
            },
            {
              type: "ci",
              section: ":repeat: CI",
              hidden: false,
            },
            {
              type: "chore",
              section: ":broom: Chore",
              hidden: false,
            },
          ],
        },
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "apps/api/package.json",
          "apps/web/package.json",
          "package.json",
          "pnpm-lock.yaml",
          "CHANGELOG.md",
        ],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}", // eslint-disable-line
      },
    ],
    "@semantic-release/github",
  ],
};
