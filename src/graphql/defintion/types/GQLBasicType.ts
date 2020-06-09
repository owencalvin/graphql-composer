import { ComposedType } from "./composed/ComposedType";
import { ClassType } from "../../../shared/ClassType";

export abstract class GQLBasicType<
  BuiltType = any,
  T extends ClassType<any> = any
> extends ComposedType<BuiltType> {
  protected _classType?: T;

  get classType() {
    return this._classType;
  }

  constructor(name?: string) {
    super(name);
  }

  abstract copy();

  abstract suffix(suffix?: string);

  static create(...args: any[]): GQLBasicType {
    throw new Error("Method not overridden");
  }

  protected toConfigMap<ReturnType>(
    arr: { name: string; build(): any }[],
  ): ReturnType {
    return arr.reduce<any>((prev, item) => {
      const built = item.build();
      prev[built.name] = {
        ...built,
      };
      return prev;
    }, {});
  }
}
