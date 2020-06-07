import {
  GraphQLField,
  Source,
  GraphQLResolveInfo,
  GraphQLOutputType,
} from "graphql";
import { GQLField } from "./GQLField";
import { ResolveFunction } from "../../types/ResolveFunction";
import { FieldType } from "../../types/FieldType";
import { TypeParser } from "../../helpers/TypeParser";
import { Arg } from "./Arg";
import { ArrayHelper, Removable } from "../../helpers/ArrayHelper";
import { Middleware } from "../middlewares/Middleware";
import { Args } from "./Args";
import { ClassType } from "../../../shared/ClassType";
import { Resolver } from "../../types/Resolver";
import { KeyValue } from "../../../shared/KeyValue";
import { InputFieldType } from "../../types/InputFieldType";
import { InputField } from "./InputField";

export class Field<NameType = string> extends GQLField<
  GraphQLField<any, any, any>
> {
  private _args: (Arg | Args)[] = [];
  private _resolve: ResolveFunction;
  private _middlewares: Middleware[] = [];

  get args() {
    return this._args;
  }

  get flatArgs() {
    return this.args.flatMap((a) => {
      if (a instanceof Args) {
        return a.args;
      }
      return a;
    });
  }

  get resolve() {
    return this._resolve;
  }

  protected constructor(name: keyof NameType, type: FieldType) {
    super(name as string, type);
  }

  static create(field: Field): Field;
  static create(field: InputField): Field;
  static create<NameType = string>(
    name: keyof NameType,
    type: FieldType,
  ): Field;
  static create<NameType = string>(
    nameOrField: keyof NameType | GQLField,
    type?: FieldType,
  ) {
    if (typeof nameOrField === "string") {
      return new Field(nameOrField as string, type);
    } else if (nameOrField instanceof GQLField) {
      const field = Field.create(nameOrField.name, nameOrField.type)
        .setDescription(nameOrField.description)
        .setDeprecationReason(nameOrField.deprecationReason);
      if (nameOrField instanceof Field) {
        field
          .setMiddlewares(...nameOrField._middlewares)
          .setResolve(nameOrField._resolve, ...nameOrField.args);
      }
      return field;
    }
  }

  setMiddlewares(...middlewares: Middleware[]) {
    this._middlewares = middlewares;
    return this;
  }

  addMiddlewares(...middlewares: Middleware[]) {
    return this.setMiddlewares(...this._middlewares, ...middlewares);
  }

  removeMiddlewares(...middlewares: Removable<Middleware>) {
    return this.setMiddlewares(
      ...ArrayHelper.remove(middlewares, this._middlewares),
    );
  }

  setArgs(...args: (Arg | Args)[]) {
    this._args = args.filter((a) => a);
    return this;
  }

  addArg<NameType = string>(arg: Arg<NameType>): Field<NameType>;
  addArg<NameType = string>(
    name: NameType,
    type: InputFieldType,
  ): Field<NameType>;
  addArg<NameType = string>(
    nameOrArg: NameType | Arg<NameType>,
    type?: InputFieldType,
  ): Field<NameType> {
    if (typeof nameOrArg === "string") {
      this.args.push(Arg.create(nameOrArg as string, type));
    } else {
      this.args.push(nameOrArg as Arg);
    }
    return this;
  }

  addArgs(...args: (Arg | Args)[]) {
    return this.setArgs(...this.args, ...args);
  }

  removeArgs(...args: Removable<Arg>) {
    return this.setArgs(...ArrayHelper.remove(args, this._args));
  }

  // TODO: Merge with setResolve
  setResolver<ResolverType extends Resolver<any>>(
    resolver: ClassType<ResolverType>,
    ...args: (Arg<keyof ResolverType> | Args<ClassType<ResolverType>>)[]
  ) {
    const instance = new resolver();
    this._resolve = instance.resolve.bind(instance);
    if (args.length > 0) {
      this.setArgs(...args);
    } else {
      this.setArgs(instance.getArgs());
    }
    return this;
  }

  setResolve<ArgsType = KeyValue>(
    resolve: ResolveFunction<ArgsType>,
    ...args: (Arg | Args)[]
  ) {
    this.setArgs(...args);
    this._resolve = resolve;
    return this;
  }

  build(): GraphQLField<any, any, any> {
    const args = this._args.flatMap((arg) => arg.build());

    this.addMiddlewares(Middleware.create(this.resolve, "__main"));

    const field: GraphQLField<any, any, any> = {
      name: this._name,
      type: TypeParser.parse<GraphQLOutputType>(this._type),
      resolve: this.resolveField,
      deprecationReason: this._deprecationReason || null,
      isDeprecated: !!this._deprecationReason,
      args,
      description: this._description,
      extensions: [],
    };

    this._built = field;

    return { ...this._built };
  }

  async resolveField(
    source: Source,
    args: any,
    context: any,
    infos: GraphQLResolveInfo,
  ) {
    const next = async (
      args: any,
      gql: any,
      index: number,
      paramsToNext: any,
    ) => {
      const nextFn = () => next(args, gql, index + 1, paramsToNext);
      const guardToExecute = this._middlewares[index].function;
      const res = await guardToExecute(args, gql, nextFn, paramsToNext);

      if (res) {
        return res;
      }
      return paramsToNext;
    };

    return await next(
      args,
      {
        source,
        context,
        infos,
      },
      0,
      {},
    );
  }
}
