import type {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Abi from "@truffle/abi-utils";

import type { Declarations as _Declarations } from "./types";
import { find as _find } from "./find";
import { bind } from "./bind";
import { HasBindings } from "./kind";
import { collectWithoutBindings } from "./collect";

export { Identifier } from "./identifier";
export { Kind } from "./kind";

export namespace Declarations {
  export const collect = (
    abi: Abi.Abi | SchemaAbi
  ): _Declarations<HasBindings> => {
    const unboundDeclarations = collectWithoutBindings(abi);

    const declarations = bind(unboundDeclarations);

    return declarations;
  };

  export const find = _find;
}

export type Declarations = _Declarations<HasBindings>;
