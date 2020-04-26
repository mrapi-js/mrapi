import * as TypeGraphQL from "type-graphql";
import { RoleCreateWithoutUsersInput } from "../inputs/RoleCreateWithoutUsersInput";
import { RoleUpdateWithoutUsersDataInput } from "../inputs/RoleUpdateWithoutUsersDataInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class RoleUpsertWithoutUsersInput {
  @TypeGraphQL.Field(_type => RoleUpdateWithoutUsersDataInput, {
    nullable: false,
    description: undefined
  })
  update!: RoleUpdateWithoutUsersDataInput;

  @TypeGraphQL.Field(_type => RoleCreateWithoutUsersInput, {
    nullable: false,
    description: undefined
  })
  create!: RoleCreateWithoutUsersInput;
}
