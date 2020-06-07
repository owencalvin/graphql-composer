import { InstanceOf } from "../../shared/InstanceOf";

export type StringKeyOf<T> = keyof InstanceOf<T> & string;
