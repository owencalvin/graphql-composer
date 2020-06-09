import { Arg } from "../fields/Arg";
import { ClassType } from "../../../shared/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../../shared/InstanceOf";
import { InputType } from "./InputType";
import { GQLBasicType } from "./GQLBasicType";

export class Args<T extends ClassType = any> extends GQLBasicType {
  protected _classType?: T;
  private _args: Arg<StringKeyOf<InstanceOf<T>>>[] = [];

  get classType() {
    return this._classType;
  }

  protected constructor(classTypeOrInputType?: T | InputType) {
    super();

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
  static create<T = any>(
    name: StringKeyOf<T>,
    type: InputFieldType,
  ): Args<ClassType<T>>;
  static create<T = any>(): Args<ClassType<T>>;
  static create<T = any>(
    classTypeOrInputTypeOrName?: T | InputType | StringKeyOf<InstanceOf<T>>,
    type?: InputFieldType,
  ) {
    if (type) {
      const args = new Args();
      return args.addArg(
        Arg.create(classTypeOrInputTypeOrName as string, type),
      );
    }
    return new Args<any>(classTypeOrInputTypeOrName);
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

  suffix(suffix = "Args") {
    this.setName(this.name + suffix);
  }

  build() {
    this._built = this._args.map((a) => a.build());
    return this.built;
  }

  copy(): Args<T> {
    return Args.create()
      .setArgs(...this.args)
      .setDescription(this.description)
      .setMeta(this.meta) as any;
  }
}
