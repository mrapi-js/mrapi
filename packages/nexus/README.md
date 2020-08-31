```ts
/**
 * Reference documentation
 *
 * https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud

// findOne FindOneUserArgs
{
  where: UserWhereUniqueInput
  select?: UserSelect | null
  include?: UserInclude | null
}

// findMany FindManyUserArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  where?: UserWhereInput | null
  orderBy?: Enumerable<UserOrderByInput> | null
  cursor?: UserWhereUniqueInput | null
  take?: number | null
  skip?: number | null
}

// create UserCreateArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  data: UserCreateInput
}

// delete FindOneUserArgs
{
  where: UserWhereUniqueInput
  select?: UserSelect | null
  include?: UserInclude | null
}

// update UserUpdateArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  data: UserUpdateInput
  where: UserWhereUniqueInput
}

// deleteMany
{
  where: UserWhereUniqueInput
}

// updateMany UserUpdateManyArgs
{
  data: UserUpdateManyMutationInput
  where?: UserWhereInput | null
}

// count FindManyUserArgs
{
  where?: UserWhereInput | null
  orderBy?: Enumerable<UserOrderByInput> | null
  skip?: number | null
  after?: UserWhereUniqueInput | null
  before?: UserWhereUniqueInput | null
  first?: number | null
  last?: number | null
}

// upsert UserUpsertArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  where: UserWhereUniqueInput
  create: UserCreateInput
  update: UserUpdateInput
}

// aggregate AggregateUserArgs
{
  where?: UserWhereInput
  orderBy?: Enumerable<UserOrderByInput>
  cursor?: UserWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<UserDistinctFieldEnum>
  count?: true
  avg?: UserAvgAggregateInputType
  sum?: UserSumAggregateInputType
  min?: UserMinAggregateInputType
  max?: UserMaxAggregateInputType
}

 *
 */
```