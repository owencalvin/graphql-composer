import {
  GraphQLField,
  Source,
  GraphQLResolveInfo,
  GraphQLOutputType,
} from "graphql";
import {
  Args,
  ResolveFunction,
  Middleware,
  FieldType,
  StringKeyOf,
  InputField,
  InstanceOf,
  Removable,
  ArrayHelper,
  KeyValue,
  ClassType,
  InputType,
  InputFieldType,
  TypeParser,
  Context,
} from "../..";
import { GQLField } from "./GQLField";

export class Field<NameType = string> extends GQLField<
  GraphQLField<any, any, any>
> {
  protected _name: NameType & string;
  private _args: Args;
  private _doParseArgs = true;
  private _resolve: ResolveFunction;
  private _middlewares: Middleware[] = [];

  get name() {
    return this._name;
  }

  get args() {
    return this._args;
  }

  get flatArgs() {
    return this._args.args;
  }

  get doParseArgs() {
    return this._doParseArgs;
  }

  get resolve() {
    return this._resolve;
  }

  protected constructor(name: string, type: FieldType) {
    super(name, type);
    this._args = Args.create();
  }

  /**
   * Create a new Field for ObjectType and InterfaceType
   */
  static create<NameType = any>(
    field: Field<any>,
  ): Field<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: InputField<any>,
  ): Field<StringKeyOf<NameType>>;
  static create<NameType = any>(
    name: StringKeyOf<InstanceOf<NameType>>,
    type: FieldType,
  ): Field<StringKeyOf<NameType>>;
  static create<NameType = any>(
    nameOrField: StringKeyOf<InstanceOf<NameType>> | GQLField,
    type?: FieldType,
  ) {
    if (typeof nameOrField === "string") {
      return new Field(nameOrField, type);
    } else if (nameOrField instanceof GQLField) {
      const field = Field.create(
        nameOrField.name,
        nameOrField.type as FieldType,
      )
        .setDescription(nameOrField.description)
        .setDeprecationReason(nameOrField.deprecationReason);
      if (nameOrField instanceof Field) {
        field
          .setMiddlewares(...nameOrField._middlewares)
          .setResolver(nameOrField._resolve, nameOrField.args);
      }
      return field;
    }
  }

  /**
   * Set the middlewares to your field
   * A middleware is executed before your main function
   * @param middlewares The middlewares list
   */
  setMiddlewares(...middlewares: Middleware[]) {
    this._middlewares = middlewares;
    return this;
  }

  /**
   * Add some middlewares to your field
   * A middleware is executed before your main function
   * @param middlewares The middlewares list
   */
  addMiddlewares(...middlewares: Middleware[]) {
    return this.setMiddlewares(...this._middlewares, ...middlewares);
  }

  /**
   * Remove some middlewares from your field
   * @param middlewares The middlewares list
   */
  removeMiddlewares(...middlewares: Removable<Middleware>) {
    return this.setMiddlewares(
      ...ArrayHelper.remove(middlewares, this._middlewares),
    );
  }

  /**
   * If you don't want to parse your aguments objects into the specified class (enabled by default)
   */
  disableArgsParsing() {
    this._doParseArgs = false;
    return this;
  }

  /**
   * If you want to parse your aguments objects into the specified class (enabled by default)
   */
  enableArgsParsing() {
    this._doParseArgs = true;
    return this;
  }

  /**
   * Add arguments to your field
   * @param args The aguments
   */
  setArgs(args: Args) {
    this._args = args;
    return this;
  }

  /**
   * Set the resolver function to your field
   * @param args The aguments
   */
  setResolver<ReturnType = any, ArgType = KeyValue>(
    resolve: ResolveFunction<ReturnType, ArgType>,
    args: Args<ClassType<ArgType>>,
  ) {
    this.setArgs(args);
    this._resolve = resolve;
    return this;
  }

  /**
   * Copy the field and return a new one
   */
  copy(): Field<NameType> {
    return Field.create(this) as any;
  }

  /**
   * Convert your field into a new field type
   * @param to The target type
   */
  convert(to: typeof InputField): InputField<NameType>;
  convert(to: typeof InputField) {
    return to.create(this.name, this.type as any) as any;
  }

  protected parseArgs(args: Args | InputType, values: KeyValue) {
    const instance = args.classType ? new args.classType() : {};

    let descriptions: [string, InputFieldType][] = [];
    if (args instanceof Args) {
      descriptions = args.args.map((a) => [a.name, a.type]);
    } else if (args instanceof InputType) {
      descriptions = args.fields.map((a) => [a.name, a.type]);
    }

    descriptions.map((description) => {
      const value = values[description[0]];
      let parsedValue = value;
      if (description[1] instanceof InputType) {
        parsedValue = this.parseArgs(description[1], value);
      }
      instance[description[0]] = parsedValue;
    });

    return instance;
  }

  build(): GraphQLField<any, any, any> {
    if (this.resolve) {
      this.addMiddlewares(Middleware.create(this.resolve, "__main"));
    }

    const args = this.flatArgs.map((arg) => arg.build());

    const field: GraphQLField<any, any, any> = {
      name: this._name,
      type: TypeParser.parse<GraphQLOutputType>(this._type),
      resolve:
        this._middlewares.length > 0 ? this.resolveField.bind(this) : undefined,
      deprecationReason: this._deprecationReason || null,
      isDeprecated: !!this._deprecationReason,
      args,
      description: this._description,
      extensions: [],
    };

    this._built = field;

    return { ...this._built };
  }

  private async resolveField(
    source: Source,
    args: any,
    context: any,
    infos: GraphQLResolveInfo,
  ) {
    const next = async (
      args: any,
      ctx: Context,
      index: number,
      paramsToNext: KeyValue,
    ) => {
      const nextFn = () => next(args, ctx, index + 1, paramsToNext);
      const guardToExecute = this._middlewares[index].function;
      const res = await guardToExecute(args, ctx, nextFn, paramsToNext);

      return res;
    };

    let parsedArgs = args;
    if (this.doParseArgs) {
      parsedArgs = this.parseArgs(this._args, args);
    }

    return await next(
      parsedArgs,
      {
        body: undefined,
        source,
        context,
        infos,
        field: this,
      },
      0,
      {},
    );
  }
}
