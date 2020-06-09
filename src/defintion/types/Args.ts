import { Arg } from "../fields/Arg";
import { ClassType } from "../../types/ClassType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { InputFieldType } from "../../types/InputFieldType";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../types/InstanceOf";
import { InputType } from "./InputType";
import { GQLBasicType } from "./GQLBasicType";

export class Args<T extends ClassType = any> extends GQLBasicType {
  protected _classType?: T;
  private _args: Arg<StringKeyOf<InstanceOf<T>>>[] = [];

  get classType() {
    return this._classType;
  }

  get args() {
    return this._args;
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

  /**
   * Create a new Args type
   */
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
      return args.addArgs(
        Arg.create(classTypeOrInputTypeOrName as string, type),
      );
    }
    return new Args<any>(classTypeOrInputTypeOrName);
  }

  /**
   * Set the arguments list of the type
   * @param args The arguments list
   */
  setArgs(...args: Arg<StringKeyOf<InstanceOf<T>>>[]) {
    this._args = args.filter((a) => a);
    return this;
  }

  /**
   * Add some arguments in the type
   * @param name The argument name
   * @param type The argument type
   */
  addArgs(...args: Arg<StringKeyOf<InstanceOf<T>>>[]) {
    return this.setArgs(...this.args, ...args);
  }

  /**
   * Add a single argument in the type
   * @param name The argument name
   * @param type The argument type
   */
  addArg(name: StringKeyOf<InstanceOf<T>>, type: InputFieldType): Args<T> {
    this.args.push(Arg.create(name, type as InputFieldType));
    return this;
  }

  /**
   * Remove some arguments in the type
   * @param args The argument IDs
   */
  removeArgs(...args: Removable<Arg>) {
    return this.setArgs(...ArrayHelper.remove(args, this._args));
  }

  /**
   * Add a suffix to the name ("Args" by default)
   * @param suffix The suffix to add @default "Args"
   */
  suffix(suffix = "Args") {
    this.setName(this.name + suffix);
  }

  build() {
    this._built = this._args.map((a) => a.build());
    return this.built;
  }

  /**
   * Copy the args type
   */
  copy(): Args<T> {
    return Args.create()
      .setArgs(...this.args)
      .setDescription(this.description)
      .setMeta(this.meta) as any;
  }
}
