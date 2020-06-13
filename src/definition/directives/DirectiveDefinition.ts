import { GQLElement } from "../../classes";
import {
  GraphQLDirective,
  DirectiveLocationEnum,
  GraphQLFieldConfigArgumentMap,
  DirectiveDefinitionNode,
  NameNode,
} from "graphql";
import { Arg } from "..";
import { Removable, ArrayHelper } from "../..";

export class Directive<ExtensionType = any> extends GQLElement<
  GraphQLDirective,
  any,
  ExtensionType
> {
  private _locations: DirectiveLocationEnum[];
  private _args: Arg<string>[] = [];
  private _isRepeatable: boolean;

  get args() {
    return this._args;
  }

  get locations() {
    return this._locations;
  }

  get isRepeatable() {
    return this._isRepeatable;
  }

  get definitionNode(): DirectiveDefinitionNode {
    return {
      kind: "DirectiveDefinition",
      name: {
        kind: "Name",
        value: this.name,
      },
      description: {
        kind: "StringValue",
        value: this.description,
      },
      repeatable: this.isRepeatable,
      locations: this.locations.map<NameNode>((l) => {
        return {
          kind: "Name",
          value: l,
        };
      }),
      arguments: this._args.map((a) => a.definitionNode),
    };
  }

  protected constructor(name: string) {
    super(name);
  }

  static create(name: string): Directive {
    return new Directive(name);
  }

  build() {
    const builtArgs = this._args.reduce<GraphQLFieldConfigArgumentMap>(
      (prev, arg) => {
        const built = arg.build();
        prev[built.name] = built;
        return prev;
      },
      {},
    );

    return new GraphQLDirective({
      name: this.name,
      locations: this.locations,
      description: this.description,
      args: builtArgs,
      isRepeatable: this.isRepeatable,
      extensions: this.extensions,
      astNode: this.definitionNode,
    });
  }

  setLocations(...locations: DirectiveLocationEnum[]) {
    this._locations = locations;
    return this;
  }

  addLocations(...locations: DirectiveLocationEnum[]) {
    return this.setLocations(...this.locations, ...locations);
  }

  removeLocations(...locations: DirectiveLocationEnum[]) {
    locations.map((d) => {
      const index = this._locations.indexOf(d);
      this._locations.splice(index, 1);
    });
    return this;
  }

  setIsRepeatable(isRepeatable: boolean) {
    this._isRepeatable = isRepeatable;
    return this;
  }

  /*
   * Set the arguments list of the type
   * @param args The arguments list
   */
  setArgs(...args: Arg<string>[]) {
    this._args = args.filter((a) => a);
    return this;
  }

  /**
   * Add some arguments in the type
   * @param name The argument name
   * @param type The argument type
   */
  addArgs(...args: Arg<string>[]) {
    return this.setArgs(...this.args, ...args);
  }

  /**
   * Remove some arguments in the type
   * @param args The argument IDs
   */
  removeArgs(...args: Removable<Arg<string>>) {
    return this.setArgs(...ArrayHelper.remove(args, this._args));
  }
}
