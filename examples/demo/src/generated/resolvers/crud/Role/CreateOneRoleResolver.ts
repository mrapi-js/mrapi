import * as TypeGraphQL from "type-graphql";
import { CreateOneRoleArgs } from "./args/CreateOneRoleArgs";
import { Role } from "../../../models/Role";

@TypeGraphQL.Resolver(_of => Role)
export class CreateOneRoleResolver {
  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: false,
    description: undefined
  })
  async createOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: CreateOneRoleArgs): Promise<Role> {
    return ctx.prisma.role.create(args);
  }
}
