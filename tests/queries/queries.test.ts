import { ObjectType } from "../../src/graphql/defintion/types/ObjectType";
import { InputType } from "../../src/graphql/defintion/types/InputType";
import { Field } from "../../src/graphql/defintion/fields/Field";
import { Args } from "../../src/graphql/defintion/types/Args";

class User {
  Username: string;

  static inputType = InputType.create(User)
    .suffix()
    .addField("Username", String);
}

class A extends User {
  a: string;
  b: number;
  user: User;

  static resolve() {}

  static args = Args.create(A)
    .addArg("a", String)
    .addArg("b", Number)
    .addArg("user", User.inputType);
}

class Z {
  z: string;
}

const user = ObjectType.create("User").addFields(
  Field.create("Email", Number).setResolver(A.resolve, A.args),
  Field.create("Username", Number).setResolver<Z>(
    A.resolve,
    Args.create(Z).addArg("z", String),
  ),
  Field.create("Role", Number).setResolver(() => {},
  Args.create().addArg("x", Date)),
);

describe("Queries", () => {
  it("Should create a resolver some arguments", async () => {});
});
