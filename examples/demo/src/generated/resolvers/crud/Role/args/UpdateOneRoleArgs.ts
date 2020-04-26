import * as TypeGraphQL from "type-graphql";
import { RoleUpdateInput } from "../../../inputs/RoleUpdateInput";
import { RoleWhereUniqueInput } from "../../../inputs/RoleWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneRoleArgs {
  @TypeGraphQL.Field(_type => RoleUpdateInput, { nullable: false })
  data!: RoleUpdateInput;

  @TypeGraphQL.Field(_type => RoleWhereUniqueInput, { nullable: false })
  where!: RoleWhereUniqueInput;
}
