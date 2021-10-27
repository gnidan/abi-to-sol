import * as semver from "semver";

export const mixed: unique symbol = Symbol();

export const allFeatures = {
  "receive-keyword": {
    ">=0.6.0": true,
    "<0.6.0": false
  },
  "fallback-keyword": {
    ">=0.6.0": true,
    "<0.6.0": false
  },
  "array-parameter-location": {
    ">=0.7.0": "memory",
    "^0.5.0 || ^0.6.0": "calldata",
    "<0.5.0": undefined
  },
  "abiencoder-v2": {
    ">=0.8.0": "default",
    "<0.8.0": "experimental",
  },
  "global-structs": {
    ">=0.6.0": true,
    "<0.6.0": false
  },
  "structs-in-interfaces": {
    ">=0.5.0": true,
    "<0.5.0": false
  },
  "custom-errors": {
    ">=0.8.4": true,
    "<0.8.4": false
  },
  "user-defined-value-types": {
    ">=0.8.8": true,
    "<0.8.8": false
  }
} as const;

export type AllFeatures = typeof allFeatures;

export type Category = keyof AllFeatures;

export type CategoryOptions<C extends Category = Category> = AllFeatures[C];

export type CategoryOptionRange<C extends Category = Category> = string & {
  [K in C]: keyof CategoryOptions<K>
}[C];

export type CategoryOption<C extends Category = Category> = {
  [K in C]: CategoryOptions<K>[CategoryOptionRange<K>]
}[C];

export type VersionFeatures = {
  [C in Category]: VersionFeature<C>;
};

export type VersionFeature<C extends Category> =
  CategoryOption<C> | typeof mixed;

export const forRange = (range: string | semver.Range): VersionFeatures => {
  const forCategory = <C extends Category>(
    category: C
  ): VersionFeature<C> => {
    const options = allFeatures[category];
    const matchingRanges: CategoryOptionRange<C>[] =
      (Object.keys(options) as CategoryOptionRange<C>[])
        .filter(optionRange => semver.intersects(range, optionRange));

    if (matchingRanges.length > 1) {
      return mixed;
    }

    const [matchingRange] = matchingRanges;
    return options[matchingRange];
  }

  return (Object.keys(allFeatures) as Category[])
    .map(<C extends Category>(category: C) => ({ [category]: forCategory(category) }))
    .reduce((a, b) => ({ ...a, ...b }), {}) as VersionFeatures;
}
