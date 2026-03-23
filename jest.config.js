/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  // parser実装をfetch統一にしたため、Jestではfile://のみsetupで補完する。
  setupFiles: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "ts-jest-mock-import-meta",
              options: {
                metaObjectReplacement: ({ fileName }) => ({
                  url: `file://${fileName}`,
                }),
              },
            },
          ],
        },
      },
    ],
  },
};
