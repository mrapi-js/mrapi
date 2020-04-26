import * as TypeGraphQL from "type-graphql";
import { UpdateOneRoleArgs } from "./args/UpdateOneRoleArgs";
import { Role } from "../../../models/Role";

@TypeGraphQL.Resolver(_of => Role)
export class UpdateOneRoleResolver {
  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: true,
    description: undefined
  })
  async updateOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: UpdateOneRoleArgs): Promise<Role | null> {
    return ctx.prisma.role.update(args);
  }
}
