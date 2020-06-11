import { GraphQLScalarType } from "graphql";
import {
  InputType,
  EnumType,
  NotNullableType,
  NullableType,
  ClassType,
} from "..";

export type InputFieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Date
  | GraphQLScalarType
  | InputType
  | EnumType
  | InputFieldType[]
  | ClassType
  | NotNullableType<InputFieldType>
  | NullableType;
