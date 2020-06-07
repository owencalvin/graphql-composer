import { Field } from "../fields/Field";
import { GraphQLObjectType } from "graphql";
import { InterfaceType } from "./InterfaceType";
import { GQLObjectType } from "./GQLObjectType";
import { InputType } from "./InputType";
import { GQLType } from "./GQLType";
import { ConversionType } from "../../types/ConversionType";
import { InstanceOf } from "../../../shared/InstanceOf";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { Type } from "../../types/Type";
import { ClassType } from "../../../shared/ClassType";
import { DIStore } from "../../../di/DIStore";

export class ObjectType<T extends ClassType<any> = any> extends GQLObjectType<
  GraphQLObjectType,
  T
> {
  protected static _types: DIStore<string, ObjectType> = new DIStore();

  protected _fields: Field[] = [];
  private _interfaces: InterfaceType[] = [];

  get fields() {
    return this._fields;
  }

  get interfaces() {
    return this._interfaces;
  }

  static create(name: string): ObjectType;
  static create(fromType: InputType): ObjectType;
  static create(objectType: ObjectType): ObjectType;
  static create(interfaceType: InterfaceType): ObjectType;
  static create<T extends Type>(
    classType: ClassType<T>,
  ): ObjectType<ClassType<T>>;
  static create<T extends Type>(
    nameOrType: string | GQLType | ClassType<T>,
  ): ObjectType<ClassType<T>> {
    if (typeof nameOrType === "string") {
      return new ObjectType(nameOrType);
    } else if (nameOrType instanceof GQLType) {
      const obj = ObjectType.create(nameOrType.name)
        .setHidden(nameOrType.hidden)
        .setDescription(nameOrType.description);

      if (nameOrType instanceof InputType) {
        obj.setFields(...nameOrType.fields.map((f) => Field.create(f)));
      } else {
        const objType = nameOrType as GQLObjectType;
        obj.setFields(...objType.fields).setExtension(obj);
        if (objType instanceof ObjectType) {
          obj.setInterfaces(...objType.interfaces);
        }
      }

      return obj;
    } else {
      const classType = nameOrType as ClassType<T>;
      const obj = ObjectType.create(classType.name);
      const instance = ObjectType._types.addInstance(obj, classType.name);
      obj._classType = classType;

      return instance;
    }
  }

  build(): GraphQLObjectType {
    this.preBuild();
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

  setInterfaces(...implementations: InterfaceType[]) {
    this._interfaces = implementations;
    return this;
  }

  addInterfaces(...interfaces: InterfaceType[]) {
    return this.setInterfaces(...this._interfaces, ...interfaces);
  }

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

  copy() {
    return ObjectType.create(this);
  }

  convert<Target extends ConversionType>(to: Target): InstanceOf<Target> {
    return to.create(this) as any;
  }

  transformFields(cb: (field: Field) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
