import { GraphQLScalarType } from "graphql";
import { NotNullableType } from "../defintion/modifiers/NotNullable";
import { GQLObjectType } from "../defintion/types/GQLObjectType";
import { EnumType } from "../defintion/types/composed/enum/EnumType";
import { UnionType } from "../defintion/types/composed/UnionType";

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
