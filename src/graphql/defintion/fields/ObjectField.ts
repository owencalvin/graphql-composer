import {
  GraphQLField,
  Source,
  GraphQLResolveInfo,
  GraphQLOutputType,
} from "graphql";
import { Field } from "./Field";
import { ResolveFunction } from "../../types/ResolveFunction";
import { FieldType } from "../../types/FieldType";
import { TypeParser } from "../../helpers/TypeParser";
import { Arg } from "./Arg";

export class ObjectField extends Field<GraphQLField<any, any, any>> {
  private _args: Arg[] = [];
  private _resolve: ResolveFunction;

  get args() {
    return this._args;
  }

  get resolve() {
    return this._resolve;
  }

  static create(name: string, type: FieldType) {
    return new ObjectField(name, type);
  }

  setResolve(resolve: ResolveFunction, ...args: Arg[]) {
    this._args = args;
    this._resolve = resolve;
    return this;
  }

  build(): GraphQLField<any, any, any> {
    const args = this._args.map((arg) => arg.build());

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

  resolveField(
    source: Source,
    args: any,
    context: any,
    infos: GraphQLResolveInfo,
  ) {
    this._resolve(args, {
      source,
      context,
      infos,
    });
  }
}
