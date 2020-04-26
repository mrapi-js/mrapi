import * as TypeGraphQL from "type-graphql";
import { UserScalarWhereInput } from "../inputs/UserScalarWhereInput";
import { UserUpdateManyDataInput } from "../inputs/UserUpdateManyDataInput";

@TypeGraphQL.InputType({
  isAbstract: true,
  description: undefined,
})
export class UserUpdateManyWithWhereNestedInput {
  @TypeGraphQL.Field(_type => UserScalarWhereInput, {
    nullable: false,
    description: undefined
  })
  where!: UserScalarWhereInput;

  @TypeGraphQL.Field(_type => UserUpdateManyDataInput, {
    nullable: false,
    description: undefined
  })
  data!: UserUpdateManyDataInput;
}
