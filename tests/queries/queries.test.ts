import { ApolloServer, gql, ApolloError } from "apollo-server";
import ApolloClient, { QueryOptions } from "apollo-boost";
import fetch from "node-fetch";
import {
  ObjectType,
  Args,
  Field,
  Schema,
  Arg,
  InputType,
  InputField,
  Middleware,
} from "../../src";

const client = new ApolloClient({
  uri: "http://localhost:4001/graphql",
  fetch,
});

class Role {
  name: string;

  static input = InputType.create(Role)
    .suffix()
    .addFields(InputField.create("name", String));

  static obj = ObjectType.create(Role)
    .suffix()
    .addFields(Field.create("name", String));
}

class User {
  name: string;
  email: string;
  role: Role;

  static obj = ObjectType.create("User").addFields(
    Field.create("name", String),
    Field.create("email", String),
    Field.create("role", Role.obj),
  );
}

const chapter = ObjectType.create("Chapter").addFields(
  Field.create("number", Number),
  Field.create("name", String),
);

const res = ObjectType.create("Response").addFields(
  Field.create("name2", String),
  Field.create("email2", String),
  Field.create("User", User.obj),
);

const query = ObjectType.create("Query").addFields(
  Field.create("user", res)
    .setResolver(
      async (args, gql) => {
        gql.body = args;
      },
      Args.create().addArgs(
        Arg.create("name2", String),
        Arg.create("email2", String),
      ),
      Args.create(User).addArgs(
        Arg.create("name", String),
        Arg.create("email", String),
        Arg.create("role", Role.input),
      ),
    )
    .addMiddlewares(
      Middleware.create(async (args, gql, next) => {
        if (args.name2 === "pass") {
          await next();
        } else {
          throw new ApolloError("middleware:1");
        }
      }),
      Middleware.create(async (args, gql, next) => {
        if (args.email2 === "pass") {
          await next();
        } else {
          throw new ApolloError("middleware:2");
        }
      }),
    ),
  Field.create("chapters", chapter),
);

const req: QueryOptions = {
  query: gql`
    query user($name2: String!, $email2: String!) {
      user(
        name: "name"
        email: "email"
        name2: $name2
        email2: $email2
        role: { name: "role" }
      ) {
        User {
          name
          email
          role {
            name
          }
        }
        name2
        email2
      }
    }
  `,
};

let server: ApolloServer;

beforeAll(async () => {
  const schema = Schema.create(
    query,
    User.obj,
    chapter,
    res,
    Role.input,
    Role.obj,
  ).build();

  server = new ApolloServer({
    schema,
    introspection: false,
    playground: false,
  });

  await server.listen(4001);
});

afterAll(async () => {
  await server.stop();
});

describe("Queries", () => {
  it("Should create a resolver some arguments and parse them correctly", async () => {
    const res1 = (
      await client.query({
        ...req,
        variables: {
          name2: "pass",
          email2: "pass",
        },
      })
    ).data.user;

    expect(res1).toEqual({
      __typename: "Response",
      name2: "pass",
      email2: "pass",
      User: {
        __typename: "User",
        name: "name",
        email: "email",
        role: {
          __typename: "RoleObject",
          name: "role",
        },
      },
    });
  });

  it("Pass through middlewares", async () => {
    let error: Error;

    try {
      await client.query({
        ...req,
        variables: {
          name2: "_",
          email2: "pass",
        },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toEqual("GraphQL error: middleware:1");

    try {
      await client.query({
        ...req,
        variables: {
          name2: "pass",
          email2: "_",
        },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toEqual("GraphQL error: middleware:2");
  });
});
