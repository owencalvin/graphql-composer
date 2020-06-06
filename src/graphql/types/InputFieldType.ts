import { GraphQLScalarType } from "graphql";
import { InputType } from "../defintion/types/InputType";
import { FieldType } from "./FieldType";
import { NotNullableType } from "../defintion/modifiers/NotNullable";

export type InputFieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Date
  | GraphQLScalarType
  | InputType
  | FieldType[]
  | NotNullableType;
