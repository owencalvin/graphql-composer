import { Field } from "./Field";
import { GraphQLArgument } from "graphql";
import { TypeParser } from "../../helpers/TypeParser";
import { FieldType } from "../../types/FieldType";

export class Arg extends Field<GraphQLArgument> {
  protected _defaultValue: string | number | boolean;

  protected constructor(name: string, type: FieldType) {
    super(name, type);
  }

  static create(name: string, type: FieldType) {
    return new Arg(name, type);
  }

  build(): GraphQLArgument {
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
