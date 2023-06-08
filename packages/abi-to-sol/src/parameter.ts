import * as Abi from "@truffle/abi-utils";
import { abiTupleSignature } from "@truffle/abi-utils";

import { Type, isType } from "./type";

export type Parameter = Abi.Parameter & {
  type: Type
};

export const isParameter = (
  parameter: Abi.Parameter
): parameter is Parameter => isType(parameter.type);

export namespace Parameter {
  export type Elementary = Abi.Parameter & {
    type: Type.Elementary
  };

  export const isElementary = (
    parameter: Parameter
  ): parameter is Elementary => Type.isElementary(parameter.type);

  export type UserDefinedValueType = Elementary & {
    internalType: string
  }

  export const isUserDefinedValueType = (
    parameter: Parameter
  ): parameter is UserDefinedValueType =>
    isElementary(parameter) &&
      !!parameter.internalType &&
      parameter.internalType !== parameter.type &&
      UserDefinedValueType.internalTypePattern.test(parameter.internalType);

  export namespace UserDefinedValueType {
    export const internalTypePattern = new RegExp(
      /^(([a-zA-Z$_][a-zA-Z0-9$_]*)\.)?([a-zA-Z$_][a-zA-Z0-9$_]*)$/
    );

    export type RecognizeResult<P extends Parameter> = (
      P extends Parameter.UserDefinedValueType
        ? {
            name: string;
            scope?: string
          }
        : {
            name: string;
            scope?: string
          } | undefined
    );

    export const recognize = <P extends Parameter>(
      parameter: P
    ): RecognizeResult<P> => {
      const { type, internalType } = parameter;

      if (!internalType || internalType === type) {
        return undefined as RecognizeResult<P>;
      }

      const match = internalType.match(internalTypePattern);
      if (!match) {
        return undefined as RecognizeResult<P>;
      }

      const scope = match[2];
      const name = match[3];

      return {
        name,
        ...(
          scope
            ? { scope }
            : {}
        )
      } as RecognizeResult<P>;
    };
  }

  export type Array = Parameter & {
    type: Type.Array
  };

  export const isArray = (
    parameter: Parameter
  ): parameter is Parameter.Array => Type.isArray(parameter.type);

  export namespace Array {
    export const item = (
      parameter: Parameter.Array
    ): Parameter => {
      const type = Type.Array.underlying(parameter.type);

      let internalType;
      {
        const match = (parameter.internalType || "").match(/^(.+)\[[^\]]*\]$/);
        if (match) {
          const [_, underlying] = match;
          internalType = underlying;
        }
      }

      return {
        ...parameter,
        type,
        ...(
          internalType && internalType !== "tuple"
            ? { internalType }
            : {}
        )
      };
    };

    export type Static = Parameter.Array & {
      type: Type.Array.Static
    };

    export const isStatic = (
      parameter: Parameter.Array
    ): parameter is Parameter.Array.Static =>
      Type.Array.isStatic(parameter.type);

    export namespace Static {
      export const length = (
        parameter: Parameter.Array.Static
      ): number => Type.Array.length(parameter.type);
    }
  }

  export type Tuple = Parameter & {
    type: Type.Tuple;
    components: Exclude<Parameter["components"], undefined>;
  }

  export const isTuple = (
    parameter: Parameter
  ): parameter is Parameter.Tuple => Type.isTuple(parameter.type);


  export namespace Tuple {
    export const internalTypePattern = new RegExp(
      /^struct (([a-zA-Z$_][a-zA-Z0-9$_]*)\.)?([a-zA-Z$_][a-zA-Z0-9$_]*)$/
    );

    export type TupleRecognizeResult = {
      signature: string;
      name?: string;
      scope?: string
    }

    export type RecognizeResult<P extends Parameter> =
      P extends Parameter.Tuple
        ? TupleRecognizeResult
        : TupleRecognizeResult | undefined;

    export const recognize = <P extends Parameter>(
      parameter: P
    ): RecognizeResult<P> => {
      if (!Parameter.isTuple(parameter)) {
        return undefined as RecognizeResult<P>;
      }

      const signature = abiTupleSignature(parameter.components);

      if (!parameter.internalType) {
        return { signature };
      }

      const match = parameter.internalType.match(internalTypePattern);
      if (!match) {
        return { signature };
      }

      const scope = match[2];
      const name = match[3];

      return {
        signature,
        name,
        ...(
          scope
            ? { scope }
            : {}
        )
      };
    };
  }
}
