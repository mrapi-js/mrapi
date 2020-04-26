import * as TypeGraphQL from "type-graphql";
import { UserCreateWithoutRoleInput } from "../inputs/UserCreateWithoutRoleInput";
import { UserUpdateWithoutRoleDataInput } from "../inputs/UserUpdateWithoutRoleDataInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserUpsertWithWhereUniqueWithoutRoleInput {
  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: false,
    description: undefined
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field(_type => UserUpdateWithoutRoleDataInput, {
    nullable: false,
    description: undefined
  })
  update!: UserUpdateWithoutRoleDataInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutRoleInput, {
    nullable: false,
    description: undefined
  })
  create!: UserCreateWithoutRoleInput;
}
