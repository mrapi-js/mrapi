import { Resolver, Query, Arg } from 'type-graphql'

import { User } from './type'

@Resolver(() => User)
export class UserResolver {
  private readonly items: User[] = [
    {
      id: '1',
      name: 'echo',
      email: 'echo@qq.com',
    },
  ]

  @Query((_returns) => User, { nullable: true })
  async user(@Arg('email') email: string): Promise<User | undefined> {
    return await this.items.find((user) => user.email === email)
  }

  @Query((_returns) => [User], {
    description: 'Get all users',
  })
  async users(): Promise<User[]> {
    return await this.items
  }
}
