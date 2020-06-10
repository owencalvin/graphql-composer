import { ClassType, KeyValue } from "../../..";
import { GQLAnyType } from "../GQLAnyType";

export abstract class GQLBasicType<
  BuiltType = any,
  T extends ClassType<any> = any,
  MetaType = KeyValue
> extends GQLAnyType<BuiltType, MetaType> {
  protected _classType?: T;

  get classType() {
    return this._classType;
  }

  constructor(name?: string) {
    super(name);
  }

  /**
   * Copy the type, it create a identical instance of the type
   */
  abstract copy();

  /**
   * Add a suffix to your type name
   * @param suffix The suffix to add
   */
  abstract suffix(suffix?: string);

  /**
   * Create a new instance of your type
   */
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
