import * as TypeGraphQL from "type-graphql";
import { UserUpdateWithoutRoleDataInput } from "../inputs/UserUpdateWithoutRoleDataInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserUpdateWithWhereUniqueWithoutRoleInput {
  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: false,
    description: undefined
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field(_type => UserUpdateWithoutRoleDataInput, {
    nullable: false,
    description: undefined
  })
  data!: UserUpdateWithoutRoleDataInput;
}
