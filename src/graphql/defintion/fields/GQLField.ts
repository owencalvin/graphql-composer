import { FieldType } from "../../types/FieldType";
import { GraphQLElement } from "../../types/GraphQLElement";
import { GraphQLField, GraphQLInputField } from "graphql";

export abstract class GQLField<BuiltType = any> extends GraphQLElement<
  BuiltType
> {
  protected _type: FieldType;
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

  abstract build(): GraphQLField<any, any, any> | GraphQLInputField;

  setType(type: FieldType) {
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

  constructor(name: string, type: FieldType) {
    super(name);
    this.setType(type);
  }
}
