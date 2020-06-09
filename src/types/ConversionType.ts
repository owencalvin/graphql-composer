import { InputType, ObjectType, InterfaceType } from "..";

export type ConversionType =
  | typeof InputType
  | typeof ObjectType
  | typeof InterfaceType;
