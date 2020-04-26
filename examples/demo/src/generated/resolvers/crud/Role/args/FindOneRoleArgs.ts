import * as TypeGraphQL from "type-graphql";
import { RoleWhereUniqueInput } from "../../../inputs/RoleWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindOneRoleArgs {
  @TypeGraphQL.Field(_type => RoleWhereUniqueInput, { nullable: false })
  where!: RoleWhereUniqueInput;
}
