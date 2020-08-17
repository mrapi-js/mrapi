export default {
  schemaFolder: 'prisma/one.prisma',
  backend: {
    generator: 'nexus-schema'
  },
  frontend: {
    graphql: true
  }
}
/**
 *
 *
 *
interface Config {
  // customize your schema.prisma file folder default: prisma/
  schemaFolder?: string;
  // add backend generator
  backend?: {
    // generator type it's require
    generator: GeneratorsType;
    // if you have our admin PrismaTable and need to customize his settings schema path default prisma/
    adminSettingsPath?: string;
  } & Options;
  // add frontend generator
  frontend?: {
    // generate admin settings and pages
    admin?: AdminPagesOptions | boolean;
    // generate graphql client documents
    graphql?: Options | boolean;
  };
}
type GeneratorsType =
  | 'nexus'
  | 'nexus-schema'
  | 'sdl'
  | 'graphql-modules';

 */
