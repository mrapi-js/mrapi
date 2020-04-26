import * as TypeGraphQL from "type-graphql";
import { UpsertOneRoleArgs } from "./args/UpsertOneRoleArgs";
import { Role } from "../../../models/Role";

@TypeGraphQL.Resolver(_of => Role)
export class UpsertOneRoleResolver {
  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: false,
    description: undefined
  })
  async upsertOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: UpsertOneRoleArgs): Promise<Role> {
    return ctx.prisma.role.upsert(args);
  }
}
