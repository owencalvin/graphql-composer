import { FieldType } from "../../types/FieldType";
import { GraphQLElement } from "../../types/GraphQLElement";
import { GraphQLField, GraphQLInputField } from "graphql";
import { InputFieldType } from "../../types/InputFieldType";
import { NotNullableType, NotNullable } from "../modifiers/NotNullable";

export abstract class GQLField<BuiltType = any> extends GraphQLElement<
  BuiltType
> {
  protected _type: FieldType | InputFieldType;
  protected _deprecationReason: string;
  protected _description: string;

  get type() {
    return this._type;
  }

  get description() {
    return this._description;
  }

  get deprecationReason() {
    return this._deprecationReason;
  }

  constructor(name: string, type: FieldType | InputFieldType) {
    super(name);
    this.setType(type);
  }

  abstract build(): GraphQLField<any, any, any> | GraphQLInputField;

  setType(type: FieldType | InputFieldType) {
    this._type = type;
    return this;
  }

  setDescription(description: string) {
    this._description = description;
    return this;
  }

  setDeprecationReason(deprecationReason: string) {
    this._deprecationReason = deprecationReason;
    return this;
  }

  nullable() {
    if (this.type instanceof NotNullableType) {
      this._type = (this._type as NotNullableType).type;
    }
    return this;
  }

  required() {
    if (!(this.type instanceof NotNullableType)) {
      this._type = NotNullable(this._type);
    }
    return this;
  }
}
