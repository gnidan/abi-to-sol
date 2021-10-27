import * as semver from "semver";

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

export type CategorySpecification<C extends Category = Category> = AllFeatures[C];

export type CategoryOptionRange<C extends Category = Category> = string & {
  [K in C]: keyof CategorySpecification<K>
}[C];

export type CategoryOption<C extends Category = Category> = {
  [K in C]: CategorySpecification<K>[CategoryOptionRange<K>]
}[C];

export type BooleanCategory = {
  [C in Category]: CategoryOption<C> extends boolean
    ? C
    : never
}[Category];

export const isBooleanCategory = (
  category: Category
): category is BooleanCategory => {
  return Object.values(allFeatures[category])
    .every(option => option === true || option === false);
};

export type VersionsFeatures = {
  [C in Category]: VersionsFeature<C>;
};

export type VersionsFeature<C extends Category> =
  C extends BooleanCategory
    ? {
        supported(): boolean;
        missing(): boolean;
        varies(): boolean;
      }
    : {
        consistently(option: CategoryOption<C>): boolean;
      };

export const forRange = (range: string | semver.Range): VersionsFeatures => {
  return (Object.keys(allFeatures) as Category[])
    .map(<C extends Category>(category: C) => {
      const specification = allFeatures[category];
      const matchingRanges: CategoryOptionRange<C>[] =
        (Object.keys(specification) as CategoryOptionRange<C>[])
          .filter(optionRange => semver.intersects(range, optionRange));

      const matchingOptions: CategoryOption<C>[] = [...new Set(
        matchingRanges.map(range => specification[range])
      )];

      if (isBooleanCategory(category)) {
        return {
          [category]: {
            supported() {
              return (
                matchingOptions.length === 1 &&
                matchingOptions[0] === true as unknown as CategoryOption<C>
              );
            },

            missing() {
              return (
                matchingOptions.indexOf(
                  true as unknown as CategoryOption<C>
                ) === -1
              )
            },

            varies() {
              return matchingOptions.length > 1;
            }
          }
        };
      }

      return {
        [category]: {
          consistently(option: CategoryOption<C>) {
            if (matchingOptions.length !== 1) {
              return false;
            }

            const [onlyOption] = matchingOptions;
            return option === onlyOption;
          }
        } as VersionsFeature<C>
      };

    })
    .reduce((a, b) => ({ ...a, ...b }), {}) as VersionsFeatures;
}
