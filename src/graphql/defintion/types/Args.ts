import { Arg } from "../fields/Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../../shared/InstanceOf";
import { InputType } from "./InputType";
import { GQLType } from "./GQLType";

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

  static create<T = any>(inputType: InputType): Args<ClassType<T>>;
  static create<T extends ClassType = any>(
    classType: T,
  ): Args<ClassType<InstanceOf<T>>>;
  static create<T = any>(): Args<ClassType<T>>;
  static create<T = any>(classTypeOrInputType?: T | InputType) {
    return new Args<any>(classTypeOrInputType);
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
  addArg(name: StringKeyOf<InstanceOf<T>>, type: InputFieldType): Args<T>;
  addArg(
    nameOrArg: Arg<StringKeyOf<InstanceOf<T>>> | StringKeyOf<InstanceOf<T>>,
    type?: InputFieldType,
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

  getArg(name: StringKeyOf<InstanceOf<T>>) {
    return ArrayHelper.find({ name }, this._args).ref;
  }

  build() {
    return this._args.map((a) => a.build());
  }
}
