import { Arg } from "./Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { StringKeyOf } from "../../types/StringKeyOf";

export class Args<T extends ClassType<any> = any> {
  private _args: Arg<StringKeyOf<T>>[] = [];
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

  setArgs(...args: Arg<StringKeyOf<T>>[]) {
    this._args = args.filter((a) => a);
    return this;
  }

  addArgs(...args: Arg<StringKeyOf<T>>[]) {
    return this.setArgs(...this.args, ...args);
  }

  addArg(arg: Arg<StringKeyOf<T>>): Args<T>;
  addArg(name: StringKeyOf<T>, type: InputFieldType | ClassType): Args<T>;
  addArg(
    nameOrArg: Arg<StringKeyOf<T>> | StringKeyOf<T>,
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
