import * as TypeGraphQL from "type-graphql";
import { AggregateRoleCountArgs } from "./args/AggregateRoleCountArgs";

@TypeGraphQL.ObjectType({
  isAbstract: true,
  description: undefined,
})
export class AggregateRole {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false,
    description: undefined
  })
  count(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AggregateRoleCountArgs) {
    return ctx.prisma.role.count(args);
  }
}
