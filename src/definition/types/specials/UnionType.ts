import { GraphQLUnionType, GraphQLTypeResolver } from "graphql";
import {
  GQLElement,
  TypeResolvable,
  ObjectType,
  Removable,
  ArrayHelper,
  KeyValue,
  TypeResolver,
  ClassType,
} from "../../..";
import { GQLAnyType } from "../GQLAnyType";

export class UnionType<MetaType = any>
  extends GQLAnyType<GraphQLUnionType, MetaType>
  implements TypeResolvable {
  protected _types: (ObjectType | ClassType)[] = [];
  protected _typeResolver: GraphQLTypeResolver<any, any>;

  get types() {
    return this._types;
  }

  get typeResolver() {
    return this._typeResolver;
  }

  protected constructor(name: string, ...types: (ObjectType | ClassType)[]) {
    super(name);
    this._typeResolver = this.defaultTypeResolver.bind(this);
    this.setTypes(...types);
  }

  static create(name: string, ...types: (ObjectType | ClassType)[]) {
    return new UnionType(name, ...types);
  }

  /**
   * Set the union type resolver
   * @param typeResolver the type resolver function
   */
  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ) {
    this._typeResolver = typeResolver;
    return this;
  }

  /**
   * Set the types of the union
   * @param types The types of the union
   */
  setTypes(...types: (ObjectType | ClassType)[]) {
    this._types = types;
    return this;
  }

  /**
   * Add some types to the union
   * @param types The types to add
   */
  addTypes(...types: (ObjectType | ClassType)[]) {
    return this.setTypes(...this._types, ...types);
  }

  /**
   * Remove some types to the union
   * @param types The types to remove
   */
  removeTypes(...types: Removable<ObjectType | ClassType>) {
    return this.setTypes(...ArrayHelper.remove(types, this._types));
  }

  /**
   * Copy the UnionType
   */
  copy() {
    return UnionType.create(this.name).addTypes(...this._types);
  }

  build(): GraphQLUnionType {
    this._built = new GraphQLUnionType({
      name: this.name,
      resolveType: this._typeResolver,
      description: this._description,
      types: () => {
        return GQLElement.built(this._types as ObjectType[]);
      },
      extensions: [],
    });

    return this.built;
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, this._types as ObjectType[]);
  }
}
