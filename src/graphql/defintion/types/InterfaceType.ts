import { GQLType } from "./GQLType";
import { GraphQLInterfaceType, GraphQLTypeResolver } from "graphql";
import { Field } from "../fields/Field";
import { ConversionType } from "../../types/ConversionType";
import { TypeResolvable } from "../../types/TypeResolvable";
import { KeyValue } from "../../../shared/KeyValue";
import { TypeResolver } from "../../helpers/TypeResolver";
import { GQLObjectType } from "./GQLObjectType";
import { ObjectType } from "./ObjectType";
import { InputType } from "./InputType";
import { ClassType } from "../../../shared/ClassType";
import { InstanceOf } from "../../../shared/InstanceOf";

export class InterfaceType<T extends ClassType = any>
  extends GQLObjectType<GraphQLInterfaceType, T>
  implements TypeResolvable {
  protected _typeResolver: GraphQLTypeResolver<any, any>;
  protected _fields: Field[];

  get fields() {
    return this._fields;
  }

  constructor(name: string) {
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
      const obj = InterfaceType.create<T>(nameOrType.name)
        .setHidden(nameOrType.hidden)
        .setDescription(nameOrType.description);

      if (nameOrType instanceof InputType) {
        obj.setFields(...nameOrType.fields.map((f) => Field.create(f)));
      } else {
        const objType = nameOrType as GQLObjectType;
        obj.setFields(...objType.fields).setExtension(obj);
      }

      return obj;
    } else {
      return InterfaceType.create<T>(nameOrType.name);
    }
  }

  build(): GraphQLInterfaceType {
    this.preBuild();

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

  copy() {
    return InterfaceType.create<T>(this);
  }

  convert<Target extends ConversionType>(to: Target): InstanceOf<Target> {
    return (to.create as any)(this);
  }

  transformFields(cb: (field: Field) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, []);
  }
}
