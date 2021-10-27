import type * as Abi from "@truffle/abi-utils";

import { Identifier } from "./identifier";

import type { Type } from "../type";

export type MissingBindings = "missing-bindings";
export type MissingDeepBindings = "missing-deep-bindings";
export type HasBindings = "has-bindings";

export type Bindings =
  | MissingBindings
  | MissingDeepBindings
  | HasBindings;

export type Kind<B extends Bindings = HasBindings> =
  | Kind.Interface<B>
  | Kind.Elementary
  | Kind.Array<B>
  | Kind.Struct<B>;

export namespace Kind {
  /*
   * Elementary
   */

  export interface Elementary {
    type: Type.Elementary;
    hints?: {
      internalType?: string;
    }
  }

  export const isElementary = <B extends Bindings>(
    kind: Kind<B>
  ): kind is Elementary => "type" in kind;

  /*
   * UserDefinedValueType (extends Elementary)
   */

  export interface UserDefinedValueType extends Elementary {
    // UDVTs are meaningless without identifier (they'd just be elementary)
    identifier: Identifier

    // UDVTs are a Solidity feature that depend on `internalType`, so require
    // the corresponding hint
    hints: {
      internalType: string;
    }
  }

  export const isUserDefinedValueType = <B extends Bindings>(
    kind: Kind<B>
  ): kind is UserDefinedValueType =>
    isElementary(kind) && "identifier" in kind;

  /*
   * Array
   */

  export interface Array<B extends Bindings = HasBindings> {
    itemKind: Kind<B>;
    length?: number;
    hints?: {}; // don't use internalType for arrays, for safety
  }

  export const isArray = <B extends Bindings>(
    kind: Kind<B>
  ): kind is Array<B> =>
    "itemKind" in kind;

  export namespace Array {
    export interface Static<
      B extends Bindings
    > extends Array<B> {
      length: number;
    }

    export const isStatic = <B extends Bindings>(
      kind: Kind<B>
    ): kind is Static<B> =>
      isArray(kind) && typeof kind.length === "number";

    export interface Dynamic<
      B extends Bindings
    > extends Array<B> {
      length: never;
    }

    export const isDynamic = <B extends Bindings>(
      kind: Kind<B>
    ): kind is Dynamic<B> =>
      isArray(kind) && typeof kind.length !== "number";
  }

  /*
   * Struct
   */

  export type Struct<B extends Bindings = HasBindings> =
    & {
        signature: string;
        hints?: {
          internalType?: string;
        }
      }
    & (
        B extends HasBindings
        ? {
            identifier: Identifier;
            members: Struct.Member<HasBindings>[];
          }
        : B extends MissingDeepBindings
        ? {
            identifier: Identifier;
            members: Struct.Member<MissingBindings>[];
          }
        : B extends MissingBindings
        ? {
            identifier?: Identifier;
            members: Struct.Member<MissingBindings>[];
          }
        : {
            identifier?: Identifier;
            members: Struct.Member<B>[];
          }
      );

  export const isStruct = <B extends Bindings>(
    kind: Kind<B>
  ): kind is Struct<B> =>
    "members" in kind;

  export namespace Struct {
    export interface Member<B extends Bindings> {
      name?: string;
      kind: Kind<B>;
    };
  }

  export type Interface<B extends Bindings = HasBindings> =
    B extends HasBindings
    ? {
        identifier: Identifier;
      }
    : B extends MissingDeepBindings
    ? {
        identifier: Identifier;
      }
    : B extends MissingBindings
    ? {
        identifier?: Identifier;
      }
    : {
        identifier?: Identifier;
    };

  export const isInterface = <B extends Bindings>(
    kind: Kind<B>
  ): kind is Interface<B> =>
    // only has key identifier
    Object.keys(kind).filter(key => key !== "identifier").length === 0
}
