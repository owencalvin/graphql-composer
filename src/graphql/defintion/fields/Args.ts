import { Arg } from "./Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../../shared/InstanceOf";

export class Args<T extends ClassType<any> = any> {
  private _args: Arg<StringKeyOf<InstanceOf<T>>>[] = [];
  private _classType?: T;

  get classType() {
    return this._classType;
  }

  protected constructor(classType?: T) {
    this._classType = classType;
  }

  static create<T extends ClassType<any>>(classType?: T) {
    return new Args<T>(classType);
  }

  get args() {
    return this._args;
  }

  setArgs(...args: Arg<StringKeyOf<InstanceOf<T>>>[]) {
    this._args = args.filter((a) => a);
    return this;
  }

  addArgs(...args: Arg<StringKeyOf<InstanceOf<T>>>[]) {
    return this.setArgs(...this.args, ...args);
  }

  addArg(arg: Arg<StringKeyOf<InstanceOf<T>>>): Args<T>;
  addArg(
    name: StringKeyOf<InstanceOf<T>>,
    type: InputFieldType | ClassType,
  ): Args<T>;
  addArg(
    nameOrArg: Arg<StringKeyOf<InstanceOf<T>>> | StringKeyOf<InstanceOf<T>>,
    type?: InputFieldType | ClassType,
  ): Args<T> {
    if (typeof nameOrArg === "string") {
      this.args.push(Arg.create(nameOrArg, type as InputFieldType));
    } else {
      this.args.push(nameOrArg as Arg);
    }
    return this;
  }

  removeArgs(...args: Removable<Arg>) {
    return this.setArgs(...ArrayHelper.remove(args, this._args));
  }

  build() {
    return this._args.map((a) => a.build());
  }
}
