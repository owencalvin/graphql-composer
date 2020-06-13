import { GraphQLArgument, InputValueDefinitionNode } from "graphql";
import {
  InputFieldType,
  StringKeyOf,
  TypeParser,
  InputField,
  Schema,
  Field,
} from "../..";
import { GQLField } from "./GQLField";

export class Arg<NameType = string, ExtensionsType = any> extends GQLField<
  GraphQLArgument,
  NameType,
  ExtensionsType
> {
  protected _defaultValue: string | number | boolean;
  protected _type: InputFieldType;

  get type() {
    return this._type;
  }

  get definitionNode(): InputValueDefinitionNode {
    return {
      name: {
        kind: "Name",
        value: this.name,
      },
      kind: "InputValueDefinition",
      description: {
        kind: "StringValue",
        value: this.description,
      },
      type: {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: TypeParser.parse(this.type).toString(),
        },
      },
      directives: this.directives.map((d) => d.definitionNode),
    };
  }

  protected constructor(name: NameType & string, type: InputFieldType) {
    super(name, type);
  }

  static create<NameType = any>(
    name: StringKeyOf<NameType>,
    type: InputFieldType,
  ): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: InputField<any>,
  ): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(arg: Arg<any>): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(field: Field<any>): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(
    nameOrField:
      | StringKeyOf<NameType>
      | InputField<any>
      | Field<any>
      | Arg<any>,
    type?: InputFieldType,
  ): Arg<StringKeyOf<NameType>> {
    if (typeof nameOrField === "string") {
      return new Arg<StringKeyOf<NameType>>(nameOrField, type);
    } else if (nameOrField instanceof GQLField) {
      return Arg.create<NameType>(nameOrField.name, nameOrField.type as any)
        .setDescription(nameOrField.description)
        .setExtensions(nameOrField.extensions)
        .setDirectives(...nameOrField.directives)
        .setDeprecationReason(nameOrField.deprecationReason);
    }
  }

  build(): GraphQLArgument {
    return {
      name: this._name,
      type: TypeParser.parse(
        this._type,
        Schema.config.requiredByDefault,
        Schema.config.arrayRequired,
      ),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: this.extensions,
    };
  }

  copy(): Arg<NameType> {
    return Arg.create(this) as any;
  }
}
