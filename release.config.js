module.exports = {
  branches: ["main", { name: "next", prerelease: true, range: '>=2.0.0' }],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits"
      }
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
              hidden: false
            },
            {
              type: "fix",
              section: ":bug: Fixes",
              hidden: false
            },
            {
              type: "docs",
              section: ":memo: Documentation",
              hidden: false
            },
            {
              type: "ci",
              section: ":repeat: CI",
              hidden: false
            },
            {
              type: "chore",
              section: ":broom: Chore",
              hidden: false
            }
          ]
        }
      }
    ],
    [
      "@google/semantic-release-replace-plugin",
      {
        replacements: [
          {
            files: ["apps/client/package.json"],
						from: "\"version\": \".*\"", // eslint-disable-line
						to: "\"version\": \"${nextRelease.version}\"", // eslint-disable-line
          }
        ]
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: ["apps/client/package.json", "pnpm-lock.yaml"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
};