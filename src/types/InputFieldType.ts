import { GraphQLScalarType } from "graphql";
import { InputType, EnumType, NotNullableType } from "..";

export type InputFieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Date
  | GraphQLScalarType
  | InputType
  | EnumType
  | InputFieldType[]
  | NotNullableType<InputFieldType>;
