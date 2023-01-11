module.exports = {
  branches: ["master"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "ci", release: false },
        ],
      },
    ],
    [
      "@google/semantic-release-replace-plugin",
      {
        replacements: [
          {
            files: ["package.json"],
            from: "\"version\": \".*\"", // eslint-disable-line
            to: "\"version\": \"${nextRelease.version}\"", // eslint-disable-line
          },
          {
            files: ["app/config.py"],
            from: "VERSION = \".*\"", // eslint-disable-line
            to: "VERSION = \"${nextRelease.version}\"", // eslint-disable-line
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
              type: "chore",
              section: ":broom: Chore",
              hidden: false,
            },
            {
              type: "ci",
              section: ":repeat: CI",
              hidden: false,
            },
          ],
        },
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["app.json", "package.json", "app/config.py", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};