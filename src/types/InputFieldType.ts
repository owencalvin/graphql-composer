import { GraphQLScalarType } from "graphql";
import { InputType } from "../defintion/types/InputType";
import { NotNullableType } from "../defintion/modifiers/NotNullable";
import { EnumType } from "../defintion/types/composed/enum/EnumType";

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
