import { Field } from "./Field";
import { Arg } from "../functions/Arg";
import { ResolveFunction } from "../../types/ResolveFunction";
import { GraphQLField } from "graphql";
import { FieldType } from "../../types/FieldType";

export class ObjectField<ArgType = any> extends Field<
  GraphQLField<any, any, any>
> {
  private _args: Arg[] = [];
  private _resolve: ResolveFunction<ArgType>;

  get args() {
    return this._args;
  }

  static create(name: string, type: FieldType) {
    return new ObjectField(name, type);
  }

  build(): GraphQLField<any, any, ArgType> {
    const args = this._args.map((arg) => arg.build());

    const field: GraphQLField<any, any, ArgType> = {
      name: this._name,
      type: this.parseType(),
      deprecationReason: this._deprecationReason || null,
      isDeprecated: !!this._deprecationReason,
      args,
      description: this._description,
      extensions: [],
    };

    this._built = field;

    return { ...this._built };
  }
}
