import * as TypeGraphQL from "type-graphql";
import { RoleCreateInput } from "../../../inputs/RoleCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneRoleArgs {
  @TypeGraphQL.Field(_type => RoleCreateInput, { nullable: false })
  data!: RoleCreateInput;
}
