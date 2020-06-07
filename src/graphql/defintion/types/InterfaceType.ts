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
import { Type } from "../../types/Type";
import { DIStore } from "../../../di/DIStore";

export class InterfaceType<T extends ClassType<any> = any>
  extends GQLObjectType<GraphQLInterfaceType, T>
  implements TypeResolvable {
  protected static _types: DIStore<string, InterfaceType> = new DIStore();

  protected _typeResolver: GraphQLTypeResolver<any, any>;
  protected _fields: Field[];

  get fields() {
    return this._fields;
  }

  protected constructor(name: string) {
    super(name);
    this.setTypeResolver(this.defaultTypeResolver);
  }

  static create(name: string): InterfaceType;
  static create(fromType: InputType): InterfaceType;
  static create(objectType: ObjectType): InterfaceType;
  static create(interfaceType: InterfaceType): InterfaceType;
  static create<T extends Type>(
    classType: ClassType<T>,
  ): InterfaceType<ClassType<T>>;
  static create<T extends Type>(
    nameOrType: string | GQLType | ClassType<T>,
  ): InterfaceType {
    if (typeof nameOrType === "string") {
      return new InterfaceType(nameOrType);
    } else if (nameOrType instanceof GQLType) {
      const obj = InterfaceType.create(nameOrType.name)
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
      const classType = nameOrType as ClassType<T>;
      const obj = InterfaceType.create(classType.name);
      const instance = InterfaceType._types.addInstance(obj, classType.name);
      obj._classType = classType;

      return instance;
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
    return InterfaceType.create(this);
  }

  convert<Target extends ConversionType>(to: Target) {
    return to.create(this) as any;
  }

  transformFields(cb: (field: Field) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, []);
  }
}
