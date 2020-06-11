import { GraphQLObjectType } from "graphql";
import {
  Field,
  InterfaceType,
  InputType,
  GQLType,
  ClassType,
  Removable,
  ArrayHelper,
  KeyValue,
} from "../../../..";
import { GQLObjectType } from "./GQLObjectType";

export class ObjectType<
  T extends ClassType = any,
  MetaType = KeyValue
> extends GQLObjectType<GraphQLObjectType, T, MetaType> {
  private _interfaces: InterfaceType[] = [];

  get interfaces() {
    return this._interfaces;
  }

  protected constructor(name: string) {
    super(name);
  }

  /**
   * Create a new ObjectType
   */
  static create<T = any>(name: string): ObjectType<ClassType<T>>;
  static create<T extends ClassType = any>(classType: T): ObjectType<T>;
  static create<T = any>(inputType: InputType): ObjectType<ClassType<T>>;
  static create<T = any>(objectType: ObjectType): ObjectType<ClassType<T>>;
  static create<T = any>(
    interfaceType: InterfaceType,
  ): ObjectType<ClassType<T>>;
  static create<T = any>(
    nameOrType: string | GQLType | ClassType<T>,
  ): ObjectType<ClassType<T>> {
    if (typeof nameOrType === "string") {
      return new ObjectType(nameOrType);
    } else if (nameOrType instanceof GQLType) {
      const obj = ObjectType.create(nameOrType.name)
        .setMeta(nameOrType.meta)
        .setDescription(nameOrType.description);

      if (nameOrType instanceof InputType) {
        obj.setFields(...nameOrType.fields.map((f) => Field.create(f)));
      } else {
        const objType = nameOrType as GQLObjectType;
        obj.setFields(...objType.fields);
        if (objType instanceof ObjectType) {
          obj.setInterfaces(...objType.interfaces);
        }
      }

      return obj;
    } else {
      const t = ObjectType.create<T>(nameOrType.name);
      t._classType = nameOrType;
      return t;
    }
  }

  build(): GraphQLObjectType {
    this._fields = [
      ...this._fields,
      ...this._interfaces.flatMap((i) => i.fields),
    ];

    const built = new GraphQLObjectType({
      name: this._name,
      description: this.description,
      fields: () => this.getFields(),
      interfaces: () => this.interfaces.map((i) => i.built),
    });

    this._built = built;

    return built;
  }

  /**
   * The interfaces to implement
   * @param interfaces
   */
  setInterfaces(...interfaces: InterfaceType[]) {
    this._interfaces = interfaces;
    return this;
  }

  /**
   * Add some interfaces to implement
   * @param interfaces the interfaces to implements
   */
  addInterfaces(...interfaces: InterfaceType[]) {
    return this.setInterfaces(...this._interfaces, ...interfaces);
  }

  /**
   * Remove some interfaces from implementation
   * @param interfaces the interfaces ID's to remove
   */
  removeInterfaces(...interfaces: Removable<InterfaceType>) {
    this._interfaces = ArrayHelper.remove(interfaces, this._interfaces);
    return this;
  }

  /**
   * Add a suffix to the name of your type ("ObjectType" by default)
   * @param suffix The suffix to add to the name
   */
  suffix(suffix = "Object") {
    return this.setName(this.name + suffix);
  }

  copy(): ObjectType<T> {
    return ObjectType.create(this) as ObjectType<T>;
  }

  convert(to: typeof InputType): InputType<T>;
  convert(to: typeof InterfaceType): InterfaceType<T>;
  convert<Target extends typeof GQLType>(to: Target) {
    return to.create(this);
  }
}
