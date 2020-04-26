import * as TypeGraphQL from "type-graphql";
import { FindManyRoleArgs } from "./args/FindManyRoleArgs";
import { Role } from "../../../models/Role";

@TypeGraphQL.Resolver(_of => Role)
export class FindManyRoleResolver {
  @TypeGraphQL.Query(_returns => [Role], {
    nullable: false,
    description: undefined
  })
  async roles(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FindManyRoleArgs): Promise<Role[]> {
    return ctx.prisma.role.findMany(args);
  }
}
