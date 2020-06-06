import { Arg } from "./Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { FieldType } from "../../types/FieldType";

export class Args<T extends ClassType<any> = any> {
  private _args: Arg<"M">[] = [];
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

  addArg(name: keyof InstanceType<T>, type: FieldType) {
    this.args.push(Arg.create(name, type));
    return this;
  }

  removeArgs(...args: Removable<Arg>) {
    return this.setArgs(...ArrayHelper.remove(args, this._args));
  }

  build() {
    return this._args.map((a) => a.build());
  }
}
