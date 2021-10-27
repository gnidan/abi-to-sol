export type Identifier =
  | Identifier.Interface
  | Identifier.Struct
  | Identifier.UserDefinedValueType;

export namespace Identifier {
  export interface Properties {
    name: string;
    scope?: string;
  }

  export type Class =
    | Struct.Class
    | Interface.Class
    | UserDefinedValueType.Class;

  export interface Interface {
    class: Interface.Class;
    name: string;
    container?: never;
  }

  export namespace Interface {
    export type Class = "interface";

    export const create = ({
      name
    }: Omit<Properties, "scope">): Identifier.Interface => ({
      class: "interface",
      name
    });

    export type Reference = `${
      Identifier["class"]
    }--${
      Identifier["name"]
    }`;
  }

  export interface Struct {
    class: Struct.Class;
    name: string;
    container?: Interface;
  }

  export namespace Struct {
    export type Class = "struct";

    export const create = ({
      name,
      scope
    }: Properties): Identifier.Struct => ({
      class: "struct",
      name,
      ...(
        scope
          ? { container: Identifier.Interface.create({ name: scope }) }
          : {}
      )
    });
  }

  export interface UserDefinedValueType {
    class: UserDefinedValueType.Class;
    name: string;
    container?: Interface;
  }


  export namespace UserDefinedValueType {
    export type Class = "udvt";

    export const create = ({
      name,
      scope
    }: Properties): Identifier.UserDefinedValueType => ({
      class: "udvt",
      name,
      ...(
        scope
          ? { container: Identifier.Interface.create({ name: scope }) }
          : {}
      )
    });
  }

  export type Reference =
    | `${
        Identifier["class"]
      }--${
        Identifier["name"]
      }`
    | `${
        Identifier["class"]
      }--${
        Identifier["name"]
      }--${
        Exclude<Identifier["container"], undefined>["name"]
      }`;

  export const toReference = (
    identifier: Identifier
  ): Reference => {
    if (identifier.container) {
      return `${identifier.class}--${identifier.name}--${identifier.container.name}`;
    }

    return `${identifier.class}--${identifier.name}`;
  }
}
