import { Type } from "./Type";
import { GraphQLInputType } from "graphql";

export class InputType extends Type<
  GraphQLInputType
> {
  build(): GraphQLInputType {
    this.preBuild();
    throw new Error("Method not implemented.");
  }
}
