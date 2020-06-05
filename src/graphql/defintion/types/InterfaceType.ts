import { GQLType } from "./GQLType";
import { GraphQLInterfaceType, GraphQLTypeResolver } from "graphql";
import { Field } from "../fields/Field";
import { TypeConverter, ConversionType } from "../../helpers/TypeConverter";
import { TypeResolvable } from "../../types/TypeResolvable";
import { KeyValue } from "../../../shared/KeyValue";
import { TypeResolver } from "../../helpers/TypeResolver";

export class InterfaceType extends GQLType<GraphQLInterfaceType>
  implements TypeResolvable {
  protected _typeResolver: GraphQLTypeResolver<any, any>;
  protected _fields: Field[];

  get fields() {
    return this._fields;
  }

  protected constructor(name: string) {
    super(name);
    this.setTypeResolver(this.defaultTypeResolver);
  }

  static create(name: string) {
    return new InterfaceType(name);
  }

  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ) {
    this._typeResolver = typeResolver;
    return this;
  }

  build(): GraphQLInterfaceType {
    this.preBuild();

    const interf: GraphQLInterfaceType = {
      name: this.name,
      description: this.description,
      resolveType: this._typeResolver,
      getFields: () => {
        return this.toConfigMap(this.fields);
      },
      getInterfaces: () => [this.built],
      toConfig: undefined,
      toJSON: undefined,
      inspect: undefined,
      extensionASTNodes: [],
      extensions: [],
    };

    this._built = interf;

    return this._built;
  }

  convert<Target extends ConversionType>(to: Target) {
    return TypeConverter.convert<Target>(this, to);
  }

  copy() {
    return InterfaceType.create(this.name)
      .setDescription(this._description)
      .setHidden(this._hidden)
      .setExtension(this._extension)
      .addFields(...this._fields);
  }

  transformFields(cb: (field: Field) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }

  defaultTypeResolver(obj: KeyValue) {
    return TypeResolver.resolve(obj, []);
  }
}
