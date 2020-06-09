import { RequestType } from "../types/RequestType";
import { Selection } from "./Selection";
import { Variable } from "./Variable";
import { InputFieldType } from "../types/InputFieldType";
import { ComposedType } from "../defintion/types/composed/ComposedType";
import { NotNullableType } from "../defintion/modifiers/NotNullable";
import { KeyValue } from "../types/KeyValue";

export type ArgValue<T> = {
  [P in keyof T]?: Partial<T[P]> | string;
};

export class Request<ArgsType = any> {
  private _type: RequestType;
  private _name: string;
  private _args: ArgValue<ArgsType>;
  private _selections: Selection;
  private _variables: Variable[] = [];

  get source() {
    return `
      ${this.type} ${this.name}${this.parseVariables()} {
        ${this.name}(${this.parseArgs(this._args)}) ${this.parseSelections(
      this.selections,
    )}
      }
    `;
  }

  get name() {
    return this._name;
  }

  get selections() {
    return this._selections;
  }

  get args() {
    return this._args;
  }

  get type() {
    return this._type;
  }

  get variables() {
    return this._variables;
  }

  protected constructor(
    type: RequestType,
    name: string,
    args: ArgValue<ArgsType>,
  ) {
    this._type = type;
    this._name = name;
    this._args = args;
  }

  static create<ArgsType = any>(
    type: RequestType,
    name: string,
    args: ArgValue<ArgsType>,
  ) {
    return new Request(type, name, args);
  }

  select(selections: Selection) {
    this._selections = selections;
    return this;
  }

  setVariables(...variables: Variable[]) {
    this._variables = variables;
    return this;
  }

  protected parseVariables() {
    if (this.variables.length > 0) {
      this.variables.reduce((prev, variable, index) => {
        prev += `$${variable.name}: ${this.parseType(variable.type)}`;
        if (index < this.variables.length - 1) {
          prev += ",";
        }
        return prev;
      }, "(") + ")";
    }
    return "";
  }

  protected parseArgs(obj: KeyValue) {
    const keys = Object.keys(obj);
    if (keys.length > 0) {
      return keys.reduce((prev, key, index) => {
        let value = obj[key];
        switch (typeof value) {
          case "object":
            value = `{ ${this.parseArgs(value)} }`;
            break;
          case "string":
            value = `"${value}"`;
        }

        prev += `${key}: ${value}`;
        if (index < keys.length - 1) {
          prev += ", ";
        }
        return prev;
      }, "");
    }
    return "";
  }

  protected parseType(type: InputFieldType) {
    if (Array.isArray(type)) {
      return this.parseType(type[0]);
    }

    switch (type) {
      case String:
        return "String";
      case Number:
        return "Float";
      case Boolean:
        return "Bool";
    }

    if (type instanceof ComposedType) {
      return type.name;
    }

    if (type instanceof NotNullableType) {
      return this.parseType(type.type as InputFieldType) + "!";
    }
  }

  protected parseSelections(selections: Selection) {
    return (
      selections.properties.reduce((prev, property) => {
        prev += property;
        if (selections.properties.length === 1 && selections.selections) {
          prev += this.parseSelections(selections.selections);
        }
        prev += "\n";
        return prev;
      }, "{\n") + "}"
    );
  }
}
