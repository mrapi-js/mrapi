import * as TypeGraphQL from "type-graphql";
import { UserCreateWithoutRoleInput } from "../inputs/UserCreateWithoutRoleInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserCreateManyWithoutRoleInput {
  @TypeGraphQL.Field(_type => [UserCreateWithoutRoleInput], {
    nullable: true,
    description: undefined
  })
  create?: UserCreateWithoutRoleInput[] | null;

  @TypeGraphQL.Field(_type => [UserWhereUniqueInput], {
    nullable: true,
    description: undefined
  })
  connect?: UserWhereUniqueInput[] | null;
}
