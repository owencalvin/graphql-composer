import { GQLType } from "./GQLType";
import { GraphQLInterfaceType, GraphQLTypeResolver } from "graphql";
import { Field } from "../fields/Field";
import { TypeResolvable } from "../../types/TypeResolvable";
import { KeyValue } from "../../../shared/KeyValue";
import { TypeResolver } from "../../helpers/TypeResolver";
import { GQLObjectType } from "./GQLObjectType";
import { ObjectType } from "./ObjectType";
import { InputType } from "./InputType";
import { ClassType } from "../../../shared/ClassType";

export class InterfaceType<T extends ClassType = any>
  extends GQLObjectType<GraphQLInterfaceType, T>
  implements TypeResolvable {
  protected _typeResolver: GraphQLTypeResolver<any, any>;

  protected constructor(name: string) {
    super(name);
    this.setTypeResolver(this.defaultTypeResolver);
  }

  static create<T = any>(name: string): InterfaceType<ClassType<T>>;
  static create<T = any>(inputType: InputType): InterfaceType<ClassType<T>>;
  static create<T = any>(objectType: ObjectType): InterfaceType<ClassType<T>>;
  static create<T = any>(
    interfaceType: InterfaceType,
  ): InterfaceType<ClassType<T>>;
  static create<T = any>(classType: ClassType<T>): InterfaceType<ClassType<T>>;
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
      return InterfaceType.create<T>(nameOrType.name);
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

  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ) {
    this._typeResolver = typeResolver;
    return this;
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
    return TypeResolver.resolve(obj, []);
  }
}
