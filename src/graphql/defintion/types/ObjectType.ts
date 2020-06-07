import { Field } from "../fields/Field";
import { GraphQLObjectType } from "graphql";
import { InterfaceType } from "./InterfaceType";
import { GQLObjectType } from "./GQLObjectType";
import { InputType } from "./InputType";
import { GQLType } from "./GQLType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { ClassType } from "../../../shared/ClassType";

export class ObjectType<T extends ClassType = any> extends GQLObjectType<
  GraphQLObjectType,
  T
> {
  private _interfaces: InterfaceType[] = [];

  get interfaces() {
    return this._interfaces;
  }

  protected constructor(name: string) {
    super(name);
  }

  static create<T = any>(name: string): ObjectType<ClassType<T>>;
  static create<T = any>(inputType: InputType): ObjectType<ClassType<T>>;
  static create<T = any>(objectType: ObjectType): ObjectType<ClassType<T>>;
  static create<T = any>(
    interfaceType: InterfaceType,
  ): ObjectType<ClassType<T>>;
  static create<T = any>(classType: ClassType<T>): ObjectType<ClassType<T>>;
  static create<T = any>(
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
        obj.setFields(...objType.fields);
        if (objType instanceof ObjectType) {
          obj.setInterfaces(...objType.interfaces);
        }
      }

      return obj;
    } else {
      return ObjectType.create<T>(nameOrType.name);
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

  copy(): ObjectType<T> {
    return ObjectType.create(this) as ObjectType<T>;
  }

  convert(to: typeof InputType): InputType<T>;
  convert(to: typeof InterfaceType): InterfaceType<T>;
  convert<Target extends typeof GQLType>(to: Target) {
    return to.create(this);
  }

  transformFields(cb: (field: Field) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
