import { FieldType } from "../../types/FieldType";
import { GraphQLElement } from "../../types/GraphQLElement";
import {
  GraphQLField,
  GraphQLInputField,
  GraphQLOutputType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean,
} from "graphql";
import { NotNullable } from "../modifiers/NotNullable";

export abstract class Field<BuiltType = any> extends GraphQLElement<BuiltType> {
  protected _type: FieldType;
  protected _deprecationReason: string;
  protected _description: string;

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

  protected constructor(name: string, type: FieldType) {
    super(name);
    this.setType(type);
  }

  parseType(type?: FieldType): GraphQLOutputType {
    let finalType: GraphQLOutputType;
    const parsedType = type || this._type;

    if (Array.isArray(parsedType)) {
      finalType = this.parseType(parsedType[0]);
    }

    switch (parsedType) {
      case String:
        finalType = GraphQLString;
        break;
      case Number:
        finalType = GraphQLFloat;
        break;
      case Boolean:
        finalType = GraphQLBoolean;
        break;
    }

    if (parsedType instanceof NotNullable) {
      finalType = GraphQLNonNull(finalType);
    }

    return finalType;
  }
}
