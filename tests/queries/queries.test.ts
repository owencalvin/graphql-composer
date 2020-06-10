import { ApolloServer, gql } from "apollo-server";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";
import {
  ObjectType,
  InputType,
  Args,
  Request,
  Selection,
  Field,
  Schema,
  InputField,
  Arg,
} from "../../src";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  fetch,
});

class User {
  Username: string;

  static readonly inputType = InputType.create(User)
    .suffix()
    .addFields(InputField.create("Username", String));
}

class A {
  a: string;
  b: number;
  user: User;

  static resolve() {
    return true;
  }

  static readonly args = Args.create(A).addArgs(
    Arg.create("a", String),
    Arg.create("b", String),
    Arg.create("user", String),
  );
}

class Response {
  code: number;

  static readonly objectType = ObjectType.create(Response).addFields(
    Field.create("code", Number),
  );
}

const request = Request.create<A>("query", "A", {
  a: "a",
  b: 0,
  user: { Username: "ven" },
}).select(Selection.create<Response>("code"));

const query = ObjectType.create("Query").addFields(
  Field.create("A", Response.objectType).setResolver(A.resolve, A.args),
);

beforeAll(async () => {
  // const server = new ApolloServer({
  //   schema: Schema.create(query, User.inputType, Response.objectType).build(),
  // });
  // const url = await server.listen();
  // console.log(url);
});

describe("Queries", () => {
  it("Should create a resolver some arguments", async () => {
    // const res = await client.query({
    //   query: gql`
    //     ${request.source}
    //   `,
    // });
  });
});
