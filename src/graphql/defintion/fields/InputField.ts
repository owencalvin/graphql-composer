import { GQLField } from "./GQLField";
import { GraphQLInputField } from "graphql";
import { TypeParser } from "../../helpers/TypeParser";
import { InputFieldType } from "../../types/InputFieldType";
import { Field } from "./Field";

export class InputField<NameType = string> extends GQLField<GraphQLInputField> {
  protected _defaultValue: string | number | boolean;

  protected constructor(name: keyof NameType, type: InputFieldType) {
    super(name as string, type);
  }

  static create(field: Field): InputField;
  static create(field: InputField): InputField;
  static create<NameType = string>(
    name: keyof NameType,
    type: InputFieldType,
  ): InputField;
  static create<NameType = string>(
    nameOrField: keyof NameType | GQLField,
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
        .setDeprecationReason(nameOrField.deprecationReason);
      return field;
    }
  }

  build() {
    const input: GraphQLInputField = {
      name: this._name,
      type: TypeParser.parse(this._type),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: [],
    };

    this._built = input;

    return this.built;
  }
}
