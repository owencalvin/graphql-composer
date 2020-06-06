import { GQLField } from "./GQLField";
import { GraphQLArgument } from "graphql";
import { TypeParser } from "../../helpers/TypeParser";
import { FieldType } from "../../types/FieldType";
import { InstanceOf } from "../../../shared/InstanceOf";

export class Arg<NameType = string> extends GQLField<GraphQLArgument> {
  protected _defaultValue: string | number | boolean;

  protected constructor(name: NameType, type: FieldType) {
    super((name as any) as string, type);
  }

  static create<NameType = string>(
    name: keyof NameType,
    type: FieldType,
  ): Arg<keyof InstanceOf<NameType>> {
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
