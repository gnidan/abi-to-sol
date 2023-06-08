export type Octal =
  | "8"
  | "16"
  | "24"
  | "32"
  | "48"
  | "56"
  | "64"
  | "72"
  | "80"
  | "88"
  | "96"
  | "104"
  | "112"
  | "120"
  | "128"
  | "136"
  | "144"
  | "152"
  | "160"
  | "168"
  | "176"
  | "184"
  | "192"
  | "200"
  | "208"
  | "216"
  | "224"
  | "232"
  | "240"
  | "248"
  | "256";

export const isOctal = (expression: string): expression is Octal => {
  const integer = parseInt(expression, 10);
  if (expression !== `${integer}`) {
    return false;
  }

  return integer % 8 === 0 && integer >= 8 && integer <= 256;
}

export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

// gotta do some janky stuff to represent the natural / whole numbers
// even still, `Whole` will disagree with `isWhole` at times (shhhh it's ok)
export type Digits = `${bigint}` & `${Digit}${string}`;
export type Natural =
  & Digits
  & `${Exclude<Digit, "0">}${string}`;
export type Whole = Natural | "0";
export const isWhole = (
  expression: string
): expression is Whole => {
  const integer = parseInt(expression, 10);
  if (expression !== `${integer}`) {
    return false;
  }

  return integer >= 0;
};

export type NaturalLessThanEqualToEighty =
  | Exclude<Digit, "0"> // 1-9
  | `${Exclude<Digit, "0" | "8" | "9">}${Digit}` // 10-79
  | "80";

export const isNaturalLessThanEqualToEighty = (
  expression: string
): expression is NaturalLessThanEqualToEighty => {
  const integer = parseInt(expression, 10);
  if (expression !== `${integer}`) {
    return false;
  }

  return integer > 0 && integer <= 80;
}

export type NaturalLessThanEqualToThirtyTwo =
  | Exclude<Digit, "0"> // 1-9
  | `${"1" | "2"}${Digit}` // 10-29
  | "30"
  | "31"
  | "32";

export const isNaturalLessThanEqualToThirtyTwo = (
  expression: string
): expression is NaturalLessThanEqualToThirtyTwo => {
  const integer = parseInt(expression, 10);
  if (expression !== `${integer}`) {
    return false;
  }

  return integer > 0 && integer <= 32;
}

export namespace Type {
  export namespace Elementary {
    export type Uint = "uint" | `uint${Octal}`;
    export const isUint = (
      expression: string
    ): expression is Uint =>
      expression === "uint" || (
        expression.startsWith("uint") &&
        isOctal(expression.slice(4))
      );

    export type Int = "int" | `int${Octal}`;
    export const isInt = (
      expression: string
    ): expression is Int =>
      expression === "int" || (
        expression.startsWith("int") &&
        isOctal(expression.slice(3))
      );

    export type Address = "address";
    export const isAddress = (
      expression: string
    ): expression is Address =>
      expression === "address";

    export type Bool = "bool";
    export const isBool = (
      expression: string
    ): expression is Bool =>
      expression === "bool";

    export type Ufixed = "ufixed" | `ufixed${Octal}x${NaturalLessThanEqualToEighty}`;
    export const isUfixed = (
      expression: string
    ): expression is Ufixed => {
      if (expression === "ufixed") {
        return true;
      }

      const match = expression.match(/^ufixed([^x]+)x([^x]+)$/);
      if (!match) {
        return false;
      }

      const [_, m, n] = match;
      return isOctal(m) && isNaturalLessThanEqualToEighty(n);
    }

    export type Fixed = "fixed" | `fixed${Octal}x${NaturalLessThanEqualToEighty}`;
    export const isFixed = (
      expression: string
    ): expression is Fixed => {
      if (expression === "fixed") {
        return true;
      }

      const match = expression.match(/^fixed([^x]+)x([^x]+)$/);
      if (!match) {
        return false;
      }

      const [_, m, n] = match;
      return isOctal(m) && isNaturalLessThanEqualToEighty(n);
    }

    export type StaticBytes = `bytes${NaturalLessThanEqualToThirtyTwo}`;
    export const isStaticBytes = (
      expression: string
    ): expression is StaticBytes =>
      expression.startsWith("bytes") &&
        isNaturalLessThanEqualToThirtyTwo(expression.slice(5));

    export type Bytes = "bytes";
    export const isBytes = (
      expression: string
    ): expression is Bytes =>
      expression === "bytes";

    export type String = "string";
    export const isString = (
      expression: string
    ): expression is String =>
      expression === "string";

    export type Function = "function";
    export const isFunction = (
      expression: string
    ): expression is Function =>
      expression === "function";
  }

  export type Elementary =
    | Elementary.Uint
    | Elementary.Int
    | Elementary.Address
    | Elementary.Bool
    | Elementary.Ufixed
    | Elementary.Fixed
    | Elementary.StaticBytes
    | Elementary.Bytes
    | Elementary.String
    | Elementary.Function;

  export const isElementary = (
    expression: string
  ): expression is Elementary =>
    Elementary.isUint(expression) ||
      Elementary.isInt(expression) ||
      Elementary.isAddress(expression) ||
      Elementary.isBool(expression) ||
      Elementary.isUfixed(expression) ||
      Elementary.isFixed(expression) ||
      Elementary.isStaticBytes(expression) ||
      Elementary.isBytes(expression) ||
      Elementary.isString(expression) ||
      Elementary.isFunction(expression);

  export namespace Array {
    export type Static = `${string}[${Whole}]`;
    export const isStatic = (
      expression: string
    ): expression is Static => {
      const match = expression.match(/^(.+)\[([0-9]+)\]$/);
      if (!match) {
        return false;
      }

      const [_, underlying, length] = match;
      return isType(underlying) && isWhole(length);
    };

    export const length = (
      type: Static
    ): number => {
      const match = type.match(/\[([0-9]+)\]$/);
      if (!match) {
        throw new Error(
          `Unexpected mismatch, type \`${type}\` is not a valid static array`
        );
      }

      const [_, length] = match;
      return parseInt(length, 10);
    }

    export type Dynamic = `${string}[]`;
    export const isDynamic = (
      expression: string
    ): expression is Dynamic => {
      const match = expression.match(/^(.+)\[\]$/);
      if (!match) {
        return false;
      }

      const [_, underlying] = match;
      return isType(underlying);
    }

    export const underlying = (
      type: Array
    ): Type => {
      const match = type.match(/^(.+)\[[^\]]*\]$/);
      if (!match) {
        throw new Error(
          `Unexpected mismatch, \`${type}\` is not a valid array type`
        );
      }

      const [_, underlying] = match;
      if (!isType(underlying)) {
        throw new Error(
          `Underlying type \`${underlying}\` is not a valid type`
        );

      }

      return underlying;
    }
  }

  export type Array =
    | Array.Static
    | Array.Dynamic;

  export const isArray = (
    expression: string
  ): expression is Array =>
    Array.isStatic(expression) ||
      Array.isDynamic(expression);

  export type Tuple = "tuple";
  export const isTuple = (
    expression: string
  ): expression is Tuple =>
    expression === "tuple";
}

export type Type =
  | Type.Elementary
  | Type.Array
  | Type.Tuple;

export const isType = (
  expression: string
): expression is Type =>
  Type.isElementary(expression) ||
    Type.isArray(expression) ||
    Type.isTuple(expression);
