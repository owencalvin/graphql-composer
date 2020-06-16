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
  InterfaceType,
  UnionType,
  EnumType,
  N,
} from "../../src";

const client = new ApolloClient({
  uri: "http://localhost:4001/graphql",
  fetch,
});

enum Roles {
  admin = "ADMIN",
  default = "DEFAULT",
}

const rolesEnum = EnumType.create("Roles", Roles);

class Animal {
  name: string;

  static inter = InterfaceType.create(Animal).addFields(
    Field.create("name", String),
  );
}

class Cow extends Animal {
  name: string;
  moh: string;

  static obj = ObjectType.create("Cow")
    .addFields(Field.create("moh", String))
    .addInterfaces(Animal.inter);
}

class Cat extends Animal {
  name: string;
  meow: string;

  static obj = ObjectType.create("Cat")
    .addInterfaces(Animal.inter)
    .addFields(Field.create("meow", String));
}

const catOrCow = UnionType.create("CatOrCow", Cat.obj, Cow.obj);

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
  animal: Animal;
  animalUnion: Cat | Cow;

  static obj = ObjectType.create("User").addFields(
    Field.create("name", String),
    Field.create("email", String),
    Field.create("role", Role.obj),
    Field.create("animal", Animal.inter),
    Field.create("animalUnion", catOrCow),
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
        const res: any = args;

        if (args.name2 === "cat") {
          const animal = new Cat();
          animal.meow = "meow";
          animal.name = "cat";
          res.User.animal = animal;
          res.User.animalUnion = animal;
        }

        if (args.name2 === "cow") {
          const animal = new Cow();
          animal.moh = "moh";
          animal.name = "cow";
          res.User.animal = animal;
          res.User.animalUnion = animal;
        }

        return res;
      },
      Args.create().addArgs(
        Arg.create("name2", String),
        Arg.create("email2", String),
        Arg.create("roleEnum", N(rolesEnum)),
      ),
      Args.create(User).addArgs(
        Arg.create("name", String),
        Arg.create("email", String),
        Arg.create("role", Role.input),
      ),
    )
    .addMiddlewares(
      async (args, gql, next) => {
        if (["pass", "cat", "cow"].includes(args.name2)) {
          await next();
        } else {
          throw new ApolloError("middleware:1");
        }
      },
      async (args, gql, next) => {
        if (args.email2 === "pass") {
          await next();
        } else {
          throw new ApolloError("middleware:2");
        }
      },
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
        roleEnum: admin
      ) {
        User {
          name
          email
          role {
            name
          }
          animal {
            name
          }
          animalUnion {
            __typename
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
    Animal.inter,
    Cow.obj,
    Cat.obj,
    rolesEnum,
    catOrCow,
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
        animal: null,
        animalUnion: null,
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

  it("Resolve the correct interface __typename with default type resolver", async () => {
    const res = (
      await client.query({
        ...req,
        variables: {
          name2: "cat",
          email2: "pass",
        },
      })
    ).data.user;
    expect(res.User.animal.__typename).toEqual("Cat");

    const res2 = (
      await client.query({
        ...req,
        variables: {
          name2: "cow",
          email2: "pass",
        },
      })
    ).data.user;
    expect(res2.User.animal.__typename).toEqual("Cow");
  });

  it("Resolve the correct union __typename with default type resolver", async () => {
    const res = (
      await client.query({
        ...req,
        variables: {
          name2: "cat",
          email2: "pass",
        },
      })
    ).data.user;
    expect(res.User.animalUnion.__typename).toEqual("Cat");

    const res2 = (
      await client.query({
        ...req,
        variables: {
          name2: "cow",
          email2: "pass",
        },
      })
    ).data.user;
    expect(res2.User.animalUnion.__typename).toEqual("Cow");
  });
});
