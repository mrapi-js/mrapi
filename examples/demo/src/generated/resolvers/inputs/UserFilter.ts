import * as TypeGraphQL from "type-graphql";
import { UserWhereInput } from "../inputs/UserWhereInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserFilter {
  @TypeGraphQL.Field(_type => UserWhereInput, {
    nullable: true,
    description: undefined
  })
  every?: UserWhereInput | null;

  @TypeGraphQL.Field(_type => UserWhereInput, {
    nullable: true,
    description: undefined
  })
  some?: UserWhereInput | null;

  @TypeGraphQL.Field(_type => UserWhereInput, {
    nullable: true,
    description: undefined
  })
  none?: UserWhereInput | null;
}
