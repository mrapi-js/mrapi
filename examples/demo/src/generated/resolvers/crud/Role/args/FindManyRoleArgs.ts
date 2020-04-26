import * as TypeGraphQL from "type-graphql";
import { RoleOrderByInput } from "../../../inputs/RoleOrderByInput";
import { RoleWhereInput } from "../../../inputs/RoleWhereInput";
import { RoleWhereUniqueInput } from "../../../inputs/RoleWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindManyRoleArgs {
  @TypeGraphQL.Field(_type => RoleWhereInput, { nullable: true })
  where?: RoleWhereInput | null;

  @TypeGraphQL.Field(_type => RoleOrderByInput, { nullable: true })
  orderBy?: RoleOrderByInput | null;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, { nullable: true })
  skip?: number | null;

  @TypeGraphQL.Field(_type => RoleWhereUniqueInput, { nullable: true })
  after?: RoleWhereUniqueInput | null;

  @TypeGraphQL.Field(_type => RoleWhereUniqueInput, { nullable: true })
  before?: RoleWhereUniqueInput | null;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, { nullable: true })
  first?: number | null;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, { nullable: true })
  last?: number | null;
}
