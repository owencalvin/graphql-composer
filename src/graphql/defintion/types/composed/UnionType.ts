import { GraphQLElement } from "../../../types/GraphQLElement";
import { GraphQLUnionType, GraphQLTypeResolver } from "graphql";
import { ComposedType } from "./ComposedType";
import { KeyValue } from "../../../../shared/KeyValue";
import { TypeResolver } from "../../../helpers/TypeResolver";
import { TypeResolvable } from "../../../types/TypeResolvable";
import { ObjectType } from "../ObjectType";
import { Removable, ArrayHelper } from "../../../helpers/ArrayHelper";

export class UnionType extends ComposedType<GraphQLUnionType>
  implements TypeResolvable {
  private _types: ObjectType[] = [];
  private _typeResolver: GraphQLTypeResolver<any, any>;

  get types() {
    return this._types;
  }

  get typeResolver() {
    return this._typeResolver;
  }

  protected constructor(name: string, ...types: ObjectType[]) {
    super(name);
    this._typeResolver = this.defaultTypeResolver;
    this.setTypes(...types);
  }

  static create(name: string, ...types: ObjectType[]) {
    return new UnionType(name, ...types);
  }

  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ) {
    this._typeResolver = typeResolver;
    return this;
  }

  setTypes(...types: ObjectType[]) {
    this._types = types;
    return this;
  }

  addTypes(...types: ObjectType[]) {
    return this.setTypes(...this._types, ...types);
  }

  removeTypes(...types: Removable<ObjectType>) {
    return this.setTypes(...ArrayHelper.remove(types, this._types));
  }

  copy() {
    return UnionType.create(this.name).addTypes(...this._types);
  }

  build(): GraphQLUnionType {
    this._built = new GraphQLUnionType({
      name: this.name,
      resolveType: this._typeResolver,
      description: this._description,
      types: () => {
        return GraphQLElement.built(this._types);
      },
      extensions: [],
    });

    return this.built;
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, this._types);
  }
}
