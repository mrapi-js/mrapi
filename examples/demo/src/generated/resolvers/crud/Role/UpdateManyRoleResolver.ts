import * as TypeGraphQL from "type-graphql";
import { UpdateManyRoleArgs } from "./args/UpdateManyRoleArgs";
import { Role } from "../../../models/Role";
import { BatchPayload } from "../../outputs/BatchPayload";

@TypeGraphQL.Resolver(_of => Role)
export class UpdateManyRoleResolver {
  @TypeGraphQL.Mutation(_returns => BatchPayload, {
    nullable: false,
    description: undefined
  })
  async updateManyRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: UpdateManyRoleArgs): Promise<BatchPayload> {
    return ctx.prisma.role.updateMany(args);
  }
}
