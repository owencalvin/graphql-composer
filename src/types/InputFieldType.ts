import { GraphQLScalarType } from "graphql";
import { InputType, EnumType, RequiredType, NullableType, ClassType } from "..";

export type InputFieldType =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Date
  | GraphQLScalarType
  | InputType<any, any>
  | EnumType
  | InputFieldType[]
  | ClassType
  | RequiredType<InputFieldType>
  | NullableType<InputFieldType>;
