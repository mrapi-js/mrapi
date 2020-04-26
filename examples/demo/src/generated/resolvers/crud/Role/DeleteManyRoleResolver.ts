import * as TypeGraphQL from "type-graphql";
import { DeleteManyRoleArgs } from "./args/DeleteManyRoleArgs";
import { Role } from "../../../models/Role";
import { BatchPayload } from "../../outputs/BatchPayload";

@TypeGraphQL.Resolver(_of => Role)
export class DeleteManyRoleResolver {
  @TypeGraphQL.Mutation(_returns => BatchPayload, {
    nullable: false,
    description: undefined
  })
  async deleteManyRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DeleteManyRoleArgs): Promise<BatchPayload> {
    return ctx.prisma.role.deleteMany(args);
  }
}
