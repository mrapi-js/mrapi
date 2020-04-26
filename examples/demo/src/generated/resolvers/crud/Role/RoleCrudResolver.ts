import * as TypeGraphQL from "type-graphql";
import { CreateOneRoleArgs } from "./args/CreateOneRoleArgs";
import { DeleteManyRoleArgs } from "./args/DeleteManyRoleArgs";
import { DeleteOneRoleArgs } from "./args/DeleteOneRoleArgs";
import { FindManyRoleArgs } from "./args/FindManyRoleArgs";
import { FindOneRoleArgs } from "./args/FindOneRoleArgs";
import { UpdateManyRoleArgs } from "./args/UpdateManyRoleArgs";
import { UpdateOneRoleArgs } from "./args/UpdateOneRoleArgs";
import { UpsertOneRoleArgs } from "./args/UpsertOneRoleArgs";
import { Role } from "../../../models/Role";
import { AggregateRole } from "../../outputs/AggregateRole";
import { BatchPayload } from "../../outputs/BatchPayload";

@TypeGraphQL.Resolver(_of => Role)
export class RoleCrudResolver {
  @TypeGraphQL.Query(_returns => Role, {
    nullable: true,
    description: undefined
  })
  async role(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FindOneRoleArgs): Promise<Role | null> {
    return ctx.prisma.role.findOne(args);
  }

  @TypeGraphQL.Query(_returns => [Role], {
    nullable: false,
    description: undefined
  })
  async roles(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FindManyRoleArgs): Promise<Role[]> {
    return ctx.prisma.role.findMany(args);
  }

  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: false,
    description: undefined
  })
  async createOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: CreateOneRoleArgs): Promise<Role> {
    return ctx.prisma.role.create(args);
  }

  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: true,
    description: undefined
  })
  async deleteOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DeleteOneRoleArgs): Promise<Role | null> {
    return ctx.prisma.role.delete(args);
  }

  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: true,
    description: undefined
  })
  async updateOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: UpdateOneRoleArgs): Promise<Role | null> {
    return ctx.prisma.role.update(args);
  }

  @TypeGraphQL.Mutation(_returns => BatchPayload, {
    nullable: false,
    description: undefined
  })
  async deleteManyRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DeleteManyRoleArgs): Promise<BatchPayload> {
    return ctx.prisma.role.deleteMany(args);
  }

  @TypeGraphQL.Mutation(_returns => BatchPayload, {
    nullable: false,
    description: undefined
  })
  async updateManyRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: UpdateManyRoleArgs): Promise<BatchPayload> {
    return ctx.prisma.role.updateMany(args);
  }

  @TypeGraphQL.Mutation(_returns => Role, {
    nullable: false,
    description: undefined
  })
  async upsertOneRole(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: UpsertOneRoleArgs): Promise<Role> {
    return ctx.prisma.role.upsert(args);
  }

  @TypeGraphQL.Query(_returns => AggregateRole, {
    nullable: false,
    description: undefined
  })
  async aggregateRole(): Promise<AggregateRole> {
    return new AggregateRole();
  }
}
