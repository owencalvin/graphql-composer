import { GraphQLElement } from "../../../types/GraphQLElement";
import { GraphQLUnionType, GraphQLTypeResolver } from "graphql";
import { Type } from "../Type";
import { ComposedType } from "./ComposedType";
import { KeyValue } from "../../../../shared/KeyValue";
import { TypeResolver } from "../../../helpers/TypeResolver";

export class UnionType extends ComposedType<GraphQLUnionType> {
  private _types: Type[] = [];
  private _typeResolver: GraphQLTypeResolver<any, any>;

  protected constructor(name: string) {
    super(name);
    this._typeResolver = this.defaultTypeResolver;
  }

  static create(name: string) {
    return new UnionType(name);
  }

  setTypeResolver(typeResolver: GraphQLTypeResolver<any, any>) {
    this._typeResolver = typeResolver;
    return this;
  }

  addTypes(...types: Type[]) {
    this._types = [...this._types, ...types];
    return this;
  }

  copy() {
    return UnionType.create(this.name).addTypes(...this._types);
  }

  build(): GraphQLUnionType {
    return new GraphQLUnionType({
      name: this.name,
      resolveType: this._typeResolver,
      description: this._description,
      types: () => {
        return GraphQLElement.built(this._types);
      },
      extensions: [],
    });
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, this._types);
  }
}
