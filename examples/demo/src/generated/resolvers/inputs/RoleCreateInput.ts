import * as TypeGraphQL from "type-graphql";
import { UserCreateManyWithoutRoleInput } from "../inputs/UserCreateManyWithoutRoleInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class RoleCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true,
    description: undefined
  })
  id?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false,
    description: undefined
  })
  name!: string;

  @TypeGraphQL.Field(_type => UserCreateManyWithoutRoleInput, {
    nullable: true,
    description: undefined
  })
  users?: UserCreateManyWithoutRoleInput | null;
}
