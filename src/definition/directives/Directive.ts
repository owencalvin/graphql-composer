import {
  GraphQLDirective,
  DirectiveNode,
  parseValue,
  ArgumentNode,
} from "graphql";
import { GQLElement } from "../../classes/GQLElement";

export class Directive<ExtensionType = any> extends GQLElement<
  GraphQLDirective,
  any,
  ExtensionType
> {
  protected _args: [string, string | number | boolean | object][] = [];

  get args() {
    return this._args;
  }

  get definitionNode(): DirectiveNode {
    return {
      kind: "Directive",
      name: {
        kind: "Name",
        value: this.name,
      },
      arguments: this._args.map<ArgumentNode>((a) => {
        let value: any = a[1];
        if (typeof value === "object") {
          value = JSON.stringify(value);
        } else {
          value = value.toString();
        }

        return {
          kind: "Argument",
          name: {
            kind: "Name",
            value: a[0],
          },
          value: parseValue(value),
        };
      }),
    };
  }

  protected constructor(name: string) {
    super(name);
  }

  static create(name: string): Directive {
    return new Directive(name);
  }

  addArg(name: string, value: string | number | boolean | object) {
    this._args = [...this._args, [name, value]];
    return this;
  }
}
