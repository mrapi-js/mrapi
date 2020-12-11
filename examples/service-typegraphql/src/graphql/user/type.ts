import { Field, ObjectType } from 'type-graphql'

@ObjectType({ description: 'User Object' })
export class User {
  @Field()
  id: string

  @Field()
  email: string

  @Field({
    nullable: true,
    description: 'user name',
  })
  name?: string
}
