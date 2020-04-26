import * as TypeGraphQL from "type-graphql";
import { User } from "../models/User";

@TypeGraphQL.ObjectType({
  isAbstract: true,
  description: undefined,
})
export class Role {
  @TypeGraphQL.Field(_type => String, {
    nullable: false,
    description: undefined,
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false,
    description: undefined,
  })
  name!: string;

  users?: User[] | null;
}
