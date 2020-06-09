import { GraphQLField, GraphQLInputField } from "graphql";
import {
  FieldType,
  GQLElement,
  InputFieldType,
  NotNullableType,
  NotNullable,
} from "../..";

export abstract class GQLField<BuiltType = any> extends GQLElement<BuiltType> {
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

  /**
   * Set the field type
   * @param type the type of your field
   */
  setType(type: FieldType | InputFieldType) {
    this._type = type;
    return this;
  }

  /**
   * Set the description of the field
   * @param deprecationReason The deprecation reason
   */
  setDescription(description: string) {
    this._description = description;
    return this;
  }

  /**
   * Set the deprecation reason of the field
   * @param deprecationReason The deprecation reason
   */
  setDeprecationReason(deprecationReason: string) {
    this._deprecationReason = deprecationReason;
    return this;
  }

  /**
   * Convert your field type into a nullable type
   */
  nullable() {
    if (this.type instanceof NotNullableType) {
      this._type = (this._type as NotNullableType).type;
    }
    return this;
  }

  /**
   * Convert your field type into a not nullable type
   */
  required() {
    if (!(this.type instanceof NotNullableType)) {
      this._type = NotNullable<any>(this._type);
    }
    return this;
  }
}
