import {
  GraphQLInputField,
  InputValueDefinitionNode,
  parseValue,
} from "graphql";
import {
  InputFieldType,
  StringKeyOf,
  InstanceOf,
  TypeParser,
  Field,
  Arg,
  Schema,
} from "../..";
import { GQLField } from "./GQLField";

export class InputField<
  NameType = string,
  ExtensionsType = any
> extends GQLField<GraphQLInputField, NameType, ExtensionsType> {
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

  /**
   * Create a field for an InputType
   */
  static create<NameType = any>(
    name: StringKeyOf<NameType>,
    type: InputFieldType,
  ): InputField<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: Field<any>,
  ): InputField<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: InputField<any>,
  ): InputField<StringKeyOf<NameType>>;
  static create<NameType = any>(
    nameOrField: StringKeyOf<InstanceOf<NameType>> | GQLField,
    type?: InputFieldType,
  ) {
    if (typeof nameOrField === "string") {
      return new InputField(nameOrField as string, type);
    } else if (nameOrField instanceof GQLField) {
      const field = InputField.create(
        nameOrField.name,
        nameOrField.type as InputFieldType,
      )
        .setDescription(nameOrField.description)
        .setExtensions(nameOrField.extensions)
        .setDirectives(...nameOrField.directives)
        .setDeprecationReason(nameOrField.deprecationReason);
      return field;
    }
  }

  build() {
    const input: GraphQLInputField = {
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

    this._built = input;

    return this.built;
  }

  copy(): InputField<NameType> {
    return InputField.create(this) as any;
  }

  convert(to: typeof Arg): Arg<NameType>;
  convert(to: typeof Field): Field<NameType>;
  convert(to: typeof Field | typeof Arg) {
    if (to === Arg) {
      return to.create(this) as any;
    } else if (to === Field) {
      return to.create(this) as any;
    }
  }
}
