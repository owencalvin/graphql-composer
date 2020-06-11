import { GraphQLScalarType } from "graphql";
import {
  NotNullableType,
  GQLObjectType,
  EnumType,
  UnionType,
  NullableType,
} from "..";
import { ClassType } from "../interfaces";

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
  | NotNullableType
  | ClassType
  | NullableType;
