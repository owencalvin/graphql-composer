import { GraphQLInterfaceType, GraphQLTypeResolver } from "graphql";
import {
  GQLType,
  ObjectType,
  ClassType,
  TypeResolvable,
  InputType,
  Field,
  KeyValue,
  TypeResolver,
} from "../../../..";
import { GQLObjectType } from "./GQLObjectType";

export class InterfaceType<T extends ClassType = any, MetaType = any>
  extends GQLObjectType<GraphQLInterfaceType, T, MetaType>
  implements TypeResolvable {
  protected _typeResolver: GraphQLTypeResolver<any, any>;
  private _possibleTypes: ObjectType[] = [];

  protected constructor(name: string) {
    super(name);
    this.setTypeResolver(this.defaultTypeResolver.bind(this));
  }

  static create<T = any>(name: string): InterfaceType<ClassType<T>>;
  static create<T extends ClassType = any>(classType: T): InterfaceType<T>;
  static create<T = any>(inputType: InputType): InterfaceType<ClassType<T>>;
  static create<T = any>(objectType: ObjectType): InterfaceType<ClassType<T>>;
  static create<T = any>(
    interfaceType: InterfaceType,
  ): InterfaceType<ClassType<T>>;
  static create<T = any>(
    nameOrType: string | GQLType | ClassType<T>,
  ): InterfaceType<ClassType<T>> {
    if (typeof nameOrType === "string") {
      return new InterfaceType(nameOrType);
    } else if (nameOrType instanceof GQLType) {
      const obj = InterfaceType.create(nameOrType.name)
        .setMeta(nameOrType.meta)
        .setDescription(nameOrType.description);

      if (nameOrType instanceof InputType) {
        obj.setFields(...nameOrType.fields.map((f) => Field.create(f)));
      } else if (nameOrType instanceof GQLObjectType) {
        obj.setFields(...nameOrType.fields);
      }

      return obj;
    } else {
      const t = InterfaceType.create<T>(nameOrType.name);
      t._classType = nameOrType;
      return t;
    }
  }

  build(): GraphQLInterfaceType {
    const built = new GraphQLInterfaceType({
      name: this.name,
      description: this.description,
      resolveType: this._typeResolver,
      fields: () => this.getFields(),
      extensions: [],
    });

    this._built = built;

    return this._built;
  }

  /**
   * Set the type of the field
   * @param typeResolver the field resolver
   */
  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ) {
    this._typeResolver = typeResolver;
    return this;
  }

  /**
   * Set the possible types of the interface to resolve the __typename
   * @param possibleTypes The possible types
   */
  setPossibleTypes(...possibleTypes: ObjectType[]) {
    possibleTypes.map((pt) => {
      if (this._possibleTypes.indexOf(pt) === -1) {
        this._possibleTypes.push(pt);
      }
    });
    return this;
  }

  /**
   * Set the possible types of the interface to resolve the __typename
   * @param possibleTypes The possible types
   */
  addPossibleTypes(...possibleTypes: ObjectType[]) {
    return this.setPossibleTypes(...this._possibleTypes, ...possibleTypes);
  }

  /**
   * Add a suffix to the name of your type ("Interface" by default)
   * @param suffix The suffix to add to the name
   */
  suffix(suffix = "Interface") {
    return this.setName(this.name + suffix);
  }

  copy(): InterfaceType<T> {
    return InterfaceType.create(this) as InterfaceType<T>;
  }

  convert(to: typeof InputType): InputType<T>;
  convert(to: typeof ObjectType): ObjectType<T>;
  convert<Target extends typeof GQLType>(to: Target) {
    return to.create(this);
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, this._possibleTypes);
  }
}
