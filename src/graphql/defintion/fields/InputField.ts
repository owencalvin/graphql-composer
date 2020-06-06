import { GQLField } from "./GQLField";
import { GraphQLInputField } from "graphql";
import { TypeParser } from "../../helpers/TypeParser";
import { InputFieldType } from "../../types/InputFieldType";

export class InputField extends GQLField<GraphQLInputField> {
  protected _defaultValue: string | number | boolean;

  protected constructor(name: string, type: InputFieldType) {
    super(name, type);
  }

  static create(name: string, type: InputFieldType) {
    return new InputField(name, type);
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
