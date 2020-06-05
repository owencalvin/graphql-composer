import { GraphQLElement } from "../../types/GraphQLElement";
import { FieldType } from "../../types/FieldType";
import { GraphQLArgument } from "graphql";

export class Arg extends GraphQLElement<GraphQLArgument> {
  private _type: FieldType;

  build(): GraphQLArgument {
    return;
  }
}
