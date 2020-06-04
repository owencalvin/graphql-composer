import { Field } from "./Field";
import { GraphQLInputField } from "graphql";

export class InputField extends Field<
  GraphQLInputField
> {
  protected _defaultValue:
    | string
    | number
    | boolean;

  build(): GraphQLInputField {
    throw new Error("Method not implemented.");
  }
}
