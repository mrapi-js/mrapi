import * as TypeGraphQL from "type-graphql";
import { DeleteOneRoleArgs } from "./args/DeleteOneRoleArgs";
import { Role } from "../../../models/Role";

@TypeGraphQL.Resolver(_of => Role)
export class DeleteOneRoleResolver {
  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: true,
    description: undefined
  })
  async deleteOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DeleteOneRoleArgs): Promise<Role | null> {
    return ctx.prisma.role.delete(args);
  }
}
