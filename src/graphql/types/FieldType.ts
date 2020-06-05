import { GraphQLScalarType } from "graphql";
import { NotNullableType } from "../defintion/modifiers/NotNullable";
import { ComposedType } from "../defintion/types/composed/ComposedType";

export type FieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | GraphQLScalarType
  | ComposedType
  | FieldType[]
  | NotNullableType;
