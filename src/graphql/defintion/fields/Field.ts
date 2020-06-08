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
import { Args } from "../types/Args";
import { ClassType } from "../../../shared/ClassType";
import { InputFieldType } from "../../types/InputFieldType";
import { InputField } from "./InputField";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../../shared/InstanceOf";

export class Field<NameType = string> extends GQLField<
  GraphQLField<any, any, any>
> {
  protected _name: NameType & string;
  private _args: Args[] = [];
  private _resolve: ResolveFunction;
  private _middlewares: Middleware[] = [];

  get name() {
    return this._name;
  }

  get args() {
    return this._args;
  }

  get flatArgs() {
    return this._args.flatMap((a) => a.args);
  }

  get resolve() {
    return this._resolve;
  }

  protected constructor(name: string, type: FieldType) {
    super(name, type);
  }

  static create<NameType = any>(
    field: Field<any>,
  ): Field<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: InputField<any>,
  ): Field<StringKeyOf<NameType>>;
  static create<NameType = any>(
    name: StringKeyOf<InstanceOf<NameType>>,
    type: FieldType,
  ): Field<StringKeyOf<NameType>>;
  static create<NameType = any>(
    nameOrField: StringKeyOf<InstanceOf<NameType>> | GQLField,
    type?: FieldType,
  ) {
    if (typeof nameOrField === "string") {
      return new Field(nameOrField, type);
    } else if (nameOrField instanceof GQLField) {
      const field = Field.create(
        nameOrField.name,
        nameOrField.type as FieldType,
      )
        .setDescription(nameOrField.description)
        .setDeprecationReason(nameOrField.deprecationReason);
      if (nameOrField instanceof Field) {
        field
          .setMiddlewares(...nameOrField._middlewares)
          .setResolver(nameOrField._resolve, ...nameOrField.args);
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

  setArgs(...args: Args[]) {
    this._args = args;
    return this;
  }

  addArgs(...args: Args[]) {
    return this.setArgs(...this.args, ...args);
  }

  removeArgs(...args: Args[]) {
    return this.setArgs(...ArrayHelper.remove<any>(args, this._args));
  }

  setResolver<ArgType = any>(
    resolve: ResolveFunction<ArgType>,
    ...args: Args<ClassType<ArgType>>[]
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

  copy(): Field<NameType> {
    return Field.create(this) as any;
  }

  convert(to: typeof InputField): InputField<NameType>;
  convert(to: typeof InputField) {
    return to.create(this.name, this.type as any) as any;
  }
}
