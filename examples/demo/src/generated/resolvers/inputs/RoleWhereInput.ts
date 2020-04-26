import * as TypeGraphQL from "type-graphql";
import { StringFilter } from "../inputs/StringFilter";
import { UserFilter } from "../inputs/UserFilter";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class RoleWhereInput {
  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true,
    description: undefined
  })
  id?: StringFilter | null;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true,
    description: undefined
  })
  name?: StringFilter | null;

  @TypeGraphQL.Field(_type => UserFilter, {
    nullable: true,
    description: undefined
  })
  users?: UserFilter | null;

  @TypeGraphQL.Field(_type => [RoleWhereInput], {
    nullable: true,
    description: undefined
  })
  AND?: RoleWhereInput[] | null;

  @TypeGraphQL.Field(_type => [RoleWhereInput], {
    nullable: true,
    description: undefined
  })
  OR?: RoleWhereInput[] | null;

  @TypeGraphQL.Field(_type => [RoleWhereInput], {
    nullable: true,
    description: undefined
  })
  NOT?: RoleWhereInput[] | null;
}
