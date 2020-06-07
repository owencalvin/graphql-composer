import { GQLType } from "./GQLType";
import { GraphQLInputObjectType, GraphQLInputFieldConfigMap } from "graphql";
import { InputField } from "../fields/InputField";
import { ConversionType } from "../../types/ConversionType";
import { ObjectType } from "./ObjectType";
import { InterfaceType } from "./InterfaceType";
import { GQLObjectType } from "./GQLObjectType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { ClassType } from "../../../shared/ClassType";
import { Type } from "../../types/Type";
import { InputFieldType } from "../../types/InputFieldType";
import { DIStore } from "../../../di/DIStore";

export class InputType<T extends ClassType<any> = any> extends GQLType<
  GraphQLInputObjectType,
  T
> {
  protected static _types: DIStore<string, InputType> = new DIStore();
  protected _fields: InputField<keyof InstanceType<T>>[];

  get fields() {
    return this._fields;
  }

  static create(name: string): InputType;
  static create(fromType: InputType): InputType;
  static create(objectType: ObjectType): InputType;
  static create(interfaceType: InterfaceType): InputType;
  static create<T extends Type>(
    classType: ClassType<T>,
  ): InputType<ClassType<T>>;
  static create<T extends Type>(
    nameOrType: string | GQLType | ClassType<T>,
  ): InputType {
    if (typeof nameOrType === "string") {
      return new InputType(nameOrType);
    } else if (nameOrType instanceof GQLType) {
      const obj = InputType.create(nameOrType.name)
        .setHidden(nameOrType.hidden)
        .setDescription(nameOrType.description);

      if (nameOrType instanceof InputType) {
        obj.setFields(...nameOrType.fields).setExtension(nameOrType._extension);
      } else {
        const objType = nameOrType as GQLObjectType;
        obj.setFields(...objType.fields.map((f) => InputField.create(f)));
      }

      return obj;
    } else {
      const classType = nameOrType as ClassType<T>;
      const obj = InputType.create(classType.name);
      const instance = InputType._types.addInstance(obj, classType.name);
      obj._classType = classType;

      return instance;
    }
  }

  build() {
    this.preBuild();

    const input = new GraphQLInputObjectType({
      name: this._name,
      description: this._description,
      fields: () => {
        return this.fields.reduce<GraphQLInputFieldConfigMap>((prev, field) => {
          prev[field.name] = field.build();
          delete prev[field.name]["isDeprecated"];
          return prev;
        }, {});
      },
      extensions: [],
    });

    this._built = input;

    return input;
  }

  setFields(...fields: InputField<keyof InstanceType<T>>[]) {
    this._fields = fields;
    return this;
  }

  addField(name: keyof InstanceType<T>, type: InputFieldType) {
    return this.setFields(...this._fields, InputField.create(name, type));
  }

  addFields(...fields: InputField<keyof InstanceType<T>>[]) {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(...fields: Removable<InputField<keyof InstanceType<T>>>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
  }

  /**
   * Add a suffix to the name of your type ("Input" by default)
   * @param suffix The suffix to add to the name
   */
  suffix(suffix = "Input") {
    return this.setName(this.name + suffix);
  }

  copy() {
    return InputType.create(this);
  }

  convert<Target extends ConversionType>(to: Target) {
    return to.create(this) as any;
  }

  transformFields(cb: (field: InputField) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
