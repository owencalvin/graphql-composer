import { GraphQLScalarType } from "graphql";
import { Type } from "../defintion/types/Type";
import { NotNullable } from "../defintion/modifiers/NotNullable";

export type FieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | GraphQLScalarType
  | Type
  | FieldType[]
  | NotNullable;
