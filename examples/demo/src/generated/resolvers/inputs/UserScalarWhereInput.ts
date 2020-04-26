import * as TypeGraphQL from "type-graphql";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { NullableStringFilter } from "../inputs/NullableStringFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserScalarWhereInput {
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

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true,
    description: undefined
  })
  email?: StringFilter | null;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true,
    description: undefined
  })
  password?: StringFilter | null;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true,
    description: undefined
  })
  createdAt?: DateTimeFilter | null;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true,
    description: undefined
  })
  updatedAt?: DateTimeFilter | null;

  @TypeGraphQL.Field(_type => NullableStringFilter, {
    nullable: true,
    description: undefined
  })
  roleId?: NullableStringFilter | null;

  @TypeGraphQL.Field(_type => [UserScalarWhereInput], {
    nullable: true,
    description: undefined
  })
  AND?: UserScalarWhereInput[] | null;

  @TypeGraphQL.Field(_type => [UserScalarWhereInput], {
    nullable: true,
    description: undefined
  })
  OR?: UserScalarWhereInput[] | null;

  @TypeGraphQL.Field(_type => [UserScalarWhereInput], {
    nullable: true,
    description: undefined
  })
  NOT?: UserScalarWhereInput[] | null;
}
