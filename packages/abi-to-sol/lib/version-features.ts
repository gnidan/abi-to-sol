import * as semver from "semver";

export const allFeatures = [
  {
    name: "separate-receive-function",
    range: ">=0.6.0",
  },
  {
    name: "use-fallback-keyword",
    range: ">=0.6.0",
  },
  {
    name: "memory-array-parameters",
    range: ">=0.7.0",
  },
  {
    name: "calldata-array-parameters",
    range: "^0.5.0 || ^0.6.0",
  },
] as const;

export type VersionFeature = typeof allFeatures[number]["name"];
export type VersionFeatures = Set<VersionFeature>;

export const featuresForVersion = (
  solidityVersion: string
): VersionFeatures => {
  const featureNames = allFeatures
    .filter(({ range }) => semver.subset(solidityVersion, range))
    .map(({ name }) => name);
  return new Set(featureNames);
};
