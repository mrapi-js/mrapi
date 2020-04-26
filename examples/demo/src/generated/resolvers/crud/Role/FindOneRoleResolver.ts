import * as TypeGraphQL from "type-graphql";
import { FindOneRoleArgs } from "./args/FindOneRoleArgs";
import { Role } from "../../../models/Role";

@TypeGraphQL.Resolver(_of => Role)
export class FindOneRoleResolver {
  @TypeGraphQL.Query(_returns => Role, {
    nullable: true,
    description: undefined
  })
  async role(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FindOneRoleArgs): Promise<Role | null> {
    return ctx.prisma.role.findOne(args);
  }
}
