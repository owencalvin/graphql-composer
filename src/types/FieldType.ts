import { GraphQLScalarType } from "graphql";
import { NotNullableType, GQLObjectType, EnumType, UnionType } from "..";

export type FieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Date
  | GraphQLScalarType
  | GQLObjectType
  | EnumType
  | UnionType
  | FieldType[]
  | NotNullableType;
