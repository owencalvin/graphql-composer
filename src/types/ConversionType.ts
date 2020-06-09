import { InputType } from "../defintion/types/InputType";
import { ObjectType } from "../defintion/types/ObjectType";
import { InterfaceType } from "../defintion/types/InterfaceType";

export type ConversionType =
  | typeof InputType
  | typeof ObjectType
  | typeof InterfaceType;
