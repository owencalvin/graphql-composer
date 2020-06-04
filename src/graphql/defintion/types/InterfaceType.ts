import { Type } from "./Type";
import { GraphQLInterfaceType } from "graphql";
import { ObjectField } from "../fields/ObjectField";
import { TypeConverter, ConversionType } from "../../helpers/TypeConverter";

export class InterfaceType extends Type<GraphQLInterfaceType> {
  protected _fields: ObjectField[];

  get fields() {
    return this._fields;
  }

  build(): GraphQLInterfaceType {
    this.preBuild();
    throw new Error("Method not implemented.");
  }

  convert<Target extends ConversionType>(to: Target) {
    return TypeConverter.convert<Target>(this, to);
  }
}
