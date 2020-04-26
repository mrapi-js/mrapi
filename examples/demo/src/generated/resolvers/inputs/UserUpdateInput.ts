import * as TypeGraphQL from "type-graphql";
import { RoleUpdateOneWithoutUsersInput } from "../inputs/RoleUpdateOneWithoutUsersInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserUpdateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true,
    description: undefined
  })
  id?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true,
    description: undefined
  })
  name?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true,
    description: undefined
  })
  email?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true,
    description: undefined
  })
  password?: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true,
    description: undefined
  })
  createdAt?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true,
    description: undefined
  })
  updatedAt?: Date | null;

  @TypeGraphQL.Field(_type => RoleUpdateOneWithoutUsersInput, {
    nullable: true,
    description: undefined
  })
  role?: RoleUpdateOneWithoutUsersInput | null;
}
