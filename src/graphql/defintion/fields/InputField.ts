import { GQLField } from "./GQLField";
import { GraphQLInputField } from "graphql";
import { TypeParser } from "../../helpers/TypeParser";
import { FieldType } from "../../types/FieldType";

export class InputField extends GQLField<GraphQLInputField> {
  protected _defaultValue: string | number | boolean;

  static create(name: string, type: FieldType) {
    return new InputField(name, type);
  }

  build(): GraphQLInputField {
    return {
      name: this._name,
      type: TypeParser.parse(this._type),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: [],
    };
  }
}
