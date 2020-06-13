import { GraphQLScalarType } from "graphql";
import {
  RequiredType,
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
  | GQLObjectType<any, any, any>
  | EnumType
  | UnionType
  | FieldType[]
  | RequiredType
  | ClassType
  | NullableType;
