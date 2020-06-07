import { Arg } from "./Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../../shared/InstanceOf";
import { InputType } from "../types/InputType";

export class Args<T extends ClassType = any> {
  private _args: Arg<StringKeyOf<InstanceOf<T>>>[] = [];
  private _classType?: T;

  get classType() {
    return this._classType;
  }

  protected constructor(classTypeOrInputType?: T | InputType) {
    if (classTypeOrInputType instanceof InputType) {
      this.addArgs(
        ...classTypeOrInputType.fields.map((f) => {
          return Arg.create(f.name, f.type);
        }),
      );
    } else {
      this._classType = classTypeOrInputType;
    }
  }

  static create<T extends ClassType = any>(inputType: InputType): Args<T>;
  static create<T extends ClassType = any>(classType: T): Args<T>;
  static create<T extends ClassType = any>(): Args<T>;
  static create<T extends ClassType = any>(
    classTypeOrInputType?: T | InputType,
  ) {
    return new Args<ClassType<T>>(classTypeOrInputType);
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
