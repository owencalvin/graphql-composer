import { Type } from "./Type";
import { GraphQLInterfaceType } from "graphql";
import { ObjectField } from "../fields/ObjectField";

export class InterfaceType extends Type<
  GraphQLInterfaceType
> {
  protected _fields: ObjectField[];

  get fields() {
    return this._fields;
  }

  build(): GraphQLInterfaceType {
    this.preBuild();
    throw new Error("Method not implemented.");
  }
}
