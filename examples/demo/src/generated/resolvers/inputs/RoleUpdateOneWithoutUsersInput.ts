import * as TypeGraphQL from "type-graphql";
import { RoleCreateWithoutUsersInput } from "../inputs/RoleCreateWithoutUsersInput";
import { RoleUpdateWithoutUsersDataInput } from "../inputs/RoleUpdateWithoutUsersDataInput";
import { RoleUpsertWithoutUsersInput } from "../inputs/RoleUpsertWithoutUsersInput";
import { RoleWhereUniqueInput } from "../inputs/RoleWhereUniqueInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class RoleUpdateOneWithoutUsersInput {
  @TypeGraphQL.Field(_type => RoleCreateWithoutUsersInput, {
    nullable: true,
    description: undefined
  })
  create?: RoleCreateWithoutUsersInput | null;

  @TypeGraphQL.Field(_type => RoleWhereUniqueInput, {
    nullable: true,
    description: undefined
  })
  connect?: RoleWhereUniqueInput | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true,
    description: undefined
  })
  disconnect?: boolean | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true,
    description: undefined
  })
  delete?: boolean | null;

  @TypeGraphQL.Field(_type => RoleUpdateWithoutUsersDataInput, {
    nullable: true,
    description: undefined
  })
  update?: RoleUpdateWithoutUsersDataInput | null;

  @TypeGraphQL.Field(_type => RoleUpsertWithoutUsersInput, {
    nullable: true,
    description: undefined
  })
  upsert?: RoleUpsertWithoutUsersInput | null;
}
