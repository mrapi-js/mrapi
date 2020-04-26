import * as TypeGraphQL from "type-graphql";
import { Role } from "../../../models/Role";
import { User } from "../../../models/User";
import { RoleUsersArgs } from "./args/RoleUsersArgs";

@TypeGraphQL.Resolver(_of => Role)
export class RoleRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [User], {
    nullable: true,
    description: undefined,
  })
  async users(@TypeGraphQL.Root() role: Role, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: RoleUsersArgs): Promise<User[] | null> {
    return ctx.prisma.role.findOne({
      where: {
        id: role.id,
      },
    }).users(args);
  }
}
