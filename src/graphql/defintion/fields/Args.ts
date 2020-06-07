import { Arg } from "./Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { Type } from "../../types/Type";
import { InputType } from "../types/InputType";
import { ClassDescriptor } from "../../helpers/ClassDescriptor";

export class Args<T extends ClassType<any> = any> {
  private _args: Arg[] = [];
  private _classType?: T;

  protected constructor(classType?: T) {
    this._classType = classType;
  }

  static create<T extends ClassType<any>>(classType?: T) {
    return new Args<T>(classType);
  }

  get args() {
    return this._args;
  }

  setArgs(...args: Arg<keyof InstanceType<T>>[]) {
    this._args = args.filter((a) => a);
    return this;
  }

  addArgs(...args: Arg<keyof InstanceType<T>>[]) {
    return this.setArgs(...this.args, ...args);
  }

  addArg(arg: Arg<keyof InstanceType<T>>): Args<T>;
  addArg(
    name: keyof InstanceType<T>,
    type: InputFieldType | ClassType,
  ): Args<T>;
  addArg(
    nameOrArg: Arg<keyof InstanceType<T>> | keyof InstanceType<T>,
    type?: InputFieldType | ClassType,
  ): Args<T> {
    if (typeof nameOrArg === "string") {
      if (ClassDescriptor.doExtends(type as ClassType, Type)) {
        this.args.push(
          Arg.create(nameOrArg, InputType.create(type as ClassType)),
        );
      } else {
        this.args.push(Arg.create(nameOrArg, type as InputFieldType));
      }
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
