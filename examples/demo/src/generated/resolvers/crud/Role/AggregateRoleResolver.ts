import * as TypeGraphQL from "type-graphql";
import { Role } from "../../../models/Role";
import { AggregateRole } from "../../outputs/AggregateRole";

@TypeGraphQL.Resolver(_of => Role)
export class AggregateRoleResolver {
  @TypeGraphQL.Query(_returns => AggregateRole, {
    nullable: false,
    description: undefined
  })
  async aggregateRole(): Promise<AggregateRole> {
    return new AggregateRole();
  }
}
