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

export class Field extends GQLField<GraphQLField<any, any, any>> {
  private _args: Arg[] = [];
  private _resolve: ResolveFunction;
  private _middlewares: Middleware[] = [];

  get args() {
    return this._args;
  }

  get resolve() {
    return this._resolve;
  }

  static create(name: string, type: FieldType) {
    return new Field(name, type);
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

  setArgs(...args: (Arg | Arg[])[]) {
    this._args = args.flatMap((a) => a);
    return this;
  }

  addArgs(...args: (Arg | Arg[])[]) {
    return this.setArgs(...this.args, ...args);
  }

  removeArgs(...args: Removable<Arg | Arg[]>) {
    return this.setArgs(...ArrayHelper.remove(args, this._args));
  }

  setResolve<ArgsType>(
    resolve: ResolveFunction<ArgsType>,
    ...args: (Arg | Arg[])[]
  ) {
    this.setArgs(...args);
    this._resolve = resolve;
    return this;
  }

  build(): GraphQLField<any, any, any> {
    const args = this._args.map((arg) => arg.build());

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
