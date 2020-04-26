import * as TypeGraphQL from "type-graphql";
import { UserUpdateManyWithoutRoleInput } from "../inputs/UserUpdateManyWithoutRoleInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class RoleUpdateInput {
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

  @TypeGraphQL.Field(_type => UserUpdateManyWithoutRoleInput, {
    nullable: true,
    description: undefined
  })
  users?: UserUpdateManyWithoutRoleInput | null;
}
