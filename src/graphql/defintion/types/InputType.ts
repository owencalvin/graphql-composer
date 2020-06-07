import { GQLType } from "./GQLType";
import { GraphQLInputObjectType, GraphQLInputFieldConfigMap } from "graphql";
import { InputField } from "../fields/InputField";
import { ConversionType } from "../../types/ConversionType";
import { ObjectType } from "./ObjectType";
import { InterfaceType } from "./InterfaceType";
import { GQLObjectType } from "./GQLObjectType";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { ClassType } from "../../../shared/ClassType";
import { InputFieldType } from "../../types/InputFieldType";
import { InstanceOf } from "../../../shared/InstanceOf";

export class InputType<T extends ClassType = any> extends GQLType<
  GraphQLInputObjectType,
  T
> {
  protected _fields: InputField<keyof InstanceType<T>>[];

  get fields() {
    return this._fields;
  }

  constructor(name: string) {
    super(name);
  }

  static create<T = any>(name: string): InputType<ClassType<T>>;
  static create<T = any>(inputType: InputType): InputType<ClassType<T>>;
  static create<T = any>(objectType: ObjectType): InputType<ClassType<T>>;
  static create<T = any>(interfaceType: InterfaceType): InputType<ClassType<T>>;
  static create<T = any>(classType: ClassType<T>): InputType<ClassType<T>>;
  static create<T = any>(
    nameOrType: string | GQLType | ClassType<T>,
  ): InputType<ClassType<T>> {
    if (typeof nameOrType === "string") {
      return new InputType(nameOrType);
    } else if (nameOrType instanceof GQLType) {
      const obj = InputType.create<T>(nameOrType.name)
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
      return InputType.create<T>(nameOrType.name);
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

  setFields(...fields: InputField<keyof InstanceType<T>>[]): InputType<T> {
    this._fields = fields;
    return this;
  }

  addField(field: InputField): InputType<T>;
  addField(name: keyof InstanceType<T>, type: InputFieldType): InputType<T>;
  addField(
    nameOrField: keyof InstanceType<T> | InputField,
    type?: InputFieldType,
  ): InputType<T> {
    let input: InputField;
    if (typeof nameOrField === "string") {
      input = InputField.create(nameOrField, type);
    } else {
      input = nameOrField as InputField;
    }

    return this.setFields(...this._fields, input);
  }

  addFields(...fields: InputField<keyof InstanceType<T>>[]): InputType<T> {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(
    ...fields: Removable<InputField<keyof InstanceType<T>>>
  ): InputType<T> {
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

  convert<Target extends ConversionType>(to: Target): InstanceOf<Target> {
    return (to.create as any)(this);
  }

  transformFields(cb: (field: InputField) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
