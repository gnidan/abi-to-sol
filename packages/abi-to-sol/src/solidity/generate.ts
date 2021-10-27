import type * as Abi from "@truffle/abi-utils";

import { version } from "../../package.json";
import { Declarations, Identifier, Kind } from "../declarations";
import { Visitor, VisitOptions, dispatch, Node } from "../visitor";
import type { VersionsFeatures } from "./features";
import type { AbiProperties } from "./analyze";
import { printType } from "./print";

import { GenerateSolidityOptions, GenerateSolidityMode } from "./options";

interface Context {
  interfaceName?: string;
  parameterModifiers?: (parameter: Abi.Parameter) => string[];
}

type Visit<N extends Node> = VisitOptions<N, Context | undefined>;

type ConstructorOptions = {
  versionsFeatures: VersionsFeatures;
  abiProperties: AbiProperties;
  declarations: Declarations;
} & Required<
  Omit<GenerateSolidityOptions, "abi" | "prettifyOutput">
>;

const shimGlobalInterfaceName = "__Structs";

export const generateRawSolidity = (
  abi: GenerateSolidityOptions["abi"],
  options: ConstructorOptions
) => dispatch({ node: abi, visitor: new SolidityGenerator(options) });

class SolidityGenerator implements Visitor<string, Context | undefined> {
  private name: string;
  private license: string;
  private mode: GenerateSolidityMode;
  private solidityVersion: string;
  private outputAttribution: boolean;
  private outputSource: boolean;
  private versionsFeatures: VersionsFeatures;
  private abiProperties: AbiProperties;
  private declarations: Declarations;

  constructor({
    name,
    license,
    mode,
    outputAttribution,
    outputSource,
    solidityVersion,
    versionsFeatures,
    abiProperties,
    declarations
  }: ConstructorOptions) {
    this.name = name;
    this.license = license;
    this.mode = mode;
    this.solidityVersion = solidityVersion;
    this.versionsFeatures = versionsFeatures;
    this.abiProperties = abiProperties;
    this.declarations = declarations;
    this.outputAttribution = outputAttribution;
    this.outputSource = outputSource;
  }

  visitAbi({node: abi}: Visit<Abi.Abi>) {
    switch (this.mode) {
      case GenerateSolidityMode.Normal: {
        return [
          this.generateHeader(),
          this.generateInterface(abi),
          this.generateExternals(),
          this.generateSourceNotice(abi),
        ].join("\n\n");
      }
      case GenerateSolidityMode.Embedded: {
        return [
          this.generateInterface(abi),
          this.generateExternals(),
        ].join("\n\n");
      }
    }
  }

  visitFunctionEntry({node: entry, context}: Visit<Abi.FunctionEntry>): string {
    const {name, inputs, stateMutability} = entry;

    return [
      `function ${name}(`,
      entry.inputs.map((node) =>
        dispatch({
          node,
          visitor: this,
          context: {
            ...context,
            parameterModifiers: (parameter: Abi.Parameter) =>
              parameter.type.startsWith("tuple") ||
              parameter.type.includes("[") ||
              parameter.type === "bytes" ||
              parameter.type === "string"
                ? [this.generateArrayParameterLocation(parameter)]
                : [],
          },
        })
      ),
      `) external`,
      this.generateStateMutability(entry),
      entry.outputs && entry.outputs.length > 0
        ? [
            `returns (`,
            entry.outputs
              .map((node) =>
                dispatch({
                  node,
                  visitor: this,
                  context: {
                    parameterModifiers: (parameter: Abi.Parameter) =>
                      parameter.type.startsWith("tuple") ||
                      parameter.type.includes("[") ||
                      parameter.type === "bytes" ||
                      parameter.type === "string"
                        ? ["memory"]
                        : [],
                  },
                })
              )
              .join(", "),
            `)`,
          ].join("")
        : ``,
      `;`,
    ].join(" ");
  }

  visitConstructorEntry({node: entry}: Visit<Abi.ConstructorEntry>): string {
    // interfaces don't have constructors
    return "";
  }

  visitFallbackEntry({ node: entry }: Visit<Abi.FallbackEntry>): string {
    const servesAsReceive = this.abiProperties["defines-receive"] &&
       !this.versionsFeatures["receive-keyword"].supported();

    const { stateMutability } = entry;
    return `${this.generateFallbackName()} () external ${
      stateMutability === "payable" || servesAsReceive ? "payable" : ""
     };`;
  }

  visitReceiveEntry() {
    // if version has receive, emit as normal
    if (this.versionsFeatures["receive-keyword"].supported()) {
      return `receive () external payable;`;
    }

    // if this ABI defines a fallback separately, emit nothing, since
    // visitFallbackEntry will cover it
    if (this.abiProperties["defines-fallback"]) {
      return "";
    }

    // otherwise, explicitly invoke visitFallbackEntry
    return this.visitFallbackEntry({
      node: { type: "fallback", stateMutability: "payable" },
    });
  }

  visitEventEntry({node: entry, context}: Visit<Abi.EventEntry>): string {
    const {name, inputs, anonymous} = entry;

    return [
      `event ${name}(`,
      inputs.map((node) =>
        dispatch({
          node,
          visitor: this,
          context: {
            ...context,
            parameterModifiers: (parameter: Abi.Parameter) =>
              // TODO fix this
              (parameter as Abi.EventParameter).indexed ? ["indexed"] : [],
          },
        })
      ),
      `)`,
      `${anonymous ? "anonymous" : ""};`,
    ].join(" ");
  }

  visitErrorEntry({node: entry, context}: Visit<Abi.ErrorEntry>): string {
    if (!this.versionsFeatures["custom-errors"].supported()) {
      throw new Error("ABI defines custom errors; use Solidity v0.8.4 or higher");
    }

    const {name, inputs} = entry;

    return [
      `error ${name}(`,
      inputs.map((node) =>
        dispatch({
          node,
          visitor: this,
          context: {
            ...context,
            parameterModifiers: (parameter: Abi.Parameter) => []
          },
        })
      ),
      `);`,
    ].join(" ");
  }

  visitParameter({ node: parameter, context }: Visit<Abi.Parameter>) {
    const kind = Declarations.find(parameter, this.declarations);
    const type = printType(kind, {
      currentInterfaceName: context?.interfaceName,
      enableGlobalStructs:
        this.versionsFeatures["global-structs"].supported(),
      enableUserDefinedValueTypes:
        this.versionsFeatures["user-defined-value-types"].supported(),
      shimGlobalInterfaceName
    });

    // @ts-ignore
    const { parameterModifiers } = context;

    return [type, ...parameterModifiers(parameter), parameter.name].join(" ");
  }

  private generateHeader(): string {
    const includeExperimentalPragma =
      this.abiProperties["needs-abiencoder-v2"] &&
      !this.versionsFeatures["abiencoder-v2"].consistently("default");

    const attribution =
      !this.outputAttribution
        ? []
        : [this.generateAttribution()]

    return [
      `// SPDX-License-Identifier: ${this.license}`,
      ...attribution,
      `pragma solidity ${this.solidityVersion};`,
      ...(
        includeExperimentalPragma
          ? [`pragma experimental ABIEncoderV2;`]
          : []
      )
    ].join("\n");
  }

  private generateAttribution(): string {
    const unit = this.mode === GenerateSolidityMode.Normal
      ? "FILE"
      : "INTERFACE"
    return this.outputSource
      ? `// !! THIS ${unit} WAS AUTOGENERATED BY abi-to-sol v${version}. SEE SOURCE BELOW. !!`
      : `// !! THIS ${unit} WAS AUTOGENERATED BY abi-to-sol v${version}. !!`;
  }

  private generateSourceNotice(abi: Abi.Abi): string {
    if (!this.outputSource) {
      return "";
    }

    return [
      ``,
      `// THIS FILE WAS AUTOGENERATED FROM THE FOLLOWING ABI JSON:`,
      `/*`,
      JSON.stringify(abi),
      `*/`,
    ].join("\n");
  }

  private generateExternals(): string {
    if (
      !this.versionsFeatures["structs-in-interfaces"].supported() &&
      Object.values(this.declarations.byIdentifierReference).some(
        ({ identifier }) => identifier.class === "struct"
      )
    ) {
      throw new Error(
        "abi-to-sol does not support custom struct types for this Solidity version"
      );
    }

    const isDeclarable =
      this.versionsFeatures["user-defined-value-types"].supported()
        ? (kind: Kind): kind is Kind.Struct | Kind.UserDefinedValueType => Kind.isStruct(kind) || Kind.isUserDefinedValueType(kind)
        : Kind.isStruct;

    const hasDifferentContainer = (
      kind: Kind.Struct | Kind.UserDefinedValueType
    ) =>
      !!kind.identifier.container &&
        kind.identifier.container.name !== this.name;

    const externalDeclarations = Object.entries(
      this.declarations.identifiersByContainer
    ).flatMap((pair) => {
      const [
        containerIdentifierReference,
        identifierReferences
      ] = pair as [
        Identifier.Interface.Reference,
        Set<Identifier.Reference>
      ];

      const kinds = new Set(
        [...identifierReferences]
          .map((identifierReference) =>
            this.declarations.byIdentifierReference[identifierReference]
          ).filter(
            (kind): kind is (
              & { identifier: { container: Identifier.Interface } }
              & (
                | Kind.Struct
                | Kind.UserDefinedValueType
              )
            ) => {
              return isDeclarable(kind) && hasDifferentContainer(kind);
            }
          )
      );

      if (!kinds.size) {
        return []
      }

      const { identifier: { container } } = [...kinds][0];

      return [{
        container,
        kinds
      }];
    }).map(({ container, kinds }) => [
      `interface ${container.name} {`,
        this.generateSiblingDeclarations(kinds, {
          interfaceName: container.name
        }),
      `}`
    ].join("\n")).join("\n\n");

    const globalKinds = new Set([
      ...this.declarations.globalIdentifiers
    ].flatMap(reference => {
      const kind = this.declarations.byIdentifierReference[reference];

      if (isDeclarable(kind)) {
        return [kind];
      }

      return [];
    }));

    if (globalKinds.size > 0) {
      const globalDeclarations = this.generateSiblingDeclarations(globalKinds);

      return [
        externalDeclarations,
        this.versionsFeatures["global-structs"].supported()
          ? globalDeclarations
          : [
              `interface ${shimGlobalInterfaceName} {`,
                globalDeclarations,
              `}`
            ].join("\n")
      ].join("\n\n");
    }

    return externalDeclarations;
  }

  private generateSiblingDeclarations(
    kinds: Set<Kind>,
    context: Pick<Context, "interfaceName"> = {}
  ): string {
    return [...kinds]
      .map(kind => {
        if (Kind.isStruct(kind)) {
          return this.generateStructDeclaration(kind, context)
        }

        if (
          this.versionsFeatures["user-defined-value-types"].supported() &&
          Kind.isUserDefinedValueType(kind)
        ) {
          return this.generateUserDefinedValueTypeDefinition(kind, context);
        }
      })
      .join("\n\n");
  }

  private generateStructDeclaration(
    kind: Kind.Struct,
    context: Pick<Context, "interfaceName"> = {}
  ): string {
    return [
      `struct ${kind.identifier.name} {`,
        ...kind.members.map(({ name, kind: memberKind}) =>
          `${
            printType(memberKind, {
              currentInterfaceName: context.interfaceName,
              enableGlobalStructs:
                this.versionsFeatures["global-structs"].supported(),
              enableUserDefinedValueTypes:
                this.versionsFeatures["user-defined-value-types"].supported(),
              shimGlobalInterfaceName
            })
          } ${name};`
        ),
      `}`
    ].join("\n");
  }

  private generateUserDefinedValueTypeDefinition(
    kind: Kind.UserDefinedValueType,
    context: Pick<Context, "interfaceName"> = {}
  ): string {
    return [
      `type ${kind.identifier.name} is ${kind.type};`
    ].join("\n");
  }


  private generateStateMutability(
    entry:
      | Abi.FunctionEntry
      | Abi.FallbackEntry
      | Abi.ConstructorEntry
      | Abi.ReceiveEntry
  ): string {
    if (entry.stateMutability && entry.stateMutability !== "nonpayable") {
      return entry.stateMutability;
    }

    return "";
  }

  private generateFallbackName(): string {
    if (this.versionsFeatures["fallback-keyword"].supported()) {
      return "fallback";
    }

    if (this.versionsFeatures["fallback-keyword"].missing()) {
      return "function";
    }

    throw new Error(
      `Desired Solidity range lacks unambigious fallback syntax.`
    );
  }

  private generateArrayParameterLocation(parameter: Abi.Parameter): string {
    const location = this.versionsFeatures["array-parameter-location"];

    if (location.consistently(undefined)) {
      return "";
    }

    if (location.consistently("memory")) {
      return "memory";
    }

    if (location.consistently("calldata")) {
      return "calldata";
    }

    throw new Error(
      `Desired Solidity range lacks unambiguous location specifier for ` +
      `parameter of type "${parameter.type}".`
    );
  }

  private generateInterface(abi: Abi.Abi): string {
    const kinds = new Set([
      ...(this.declarations.identifiersByContainer[
        Identifier.toReference({ class: "interface", name: this.name })
      ] || [])
    ].map(reference => this.declarations.byIdentifierReference[reference]));

    return [
      `interface ${this.name} {`,
        ...(
          this.mode === GenerateSolidityMode.Embedded && this.outputAttribution
            ? [this.generateAttribution()]
            : []
        ),
      this.generateSiblingDeclarations(kinds, { interfaceName: this.name }),
        ``,
        ...abi.map((node) => dispatch({
          node,
          context: { interfaceName: this.name },
          visitor: this
        })),
        ...(
          this.mode === GenerateSolidityMode.Embedded
            ? [this.generateSourceNotice(abi)]
            : []
        ),
      `}`,
    ].join("\n");
  }
}
