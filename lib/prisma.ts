// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from "./generated/prisma/client";


// const connectionString = `${process.env.PRISMA_DATABASE_URL}`;
// const adapter = new PrismaPg({ connectionString })

// const prismaClientSingleton = () => {
//     return new PrismaClient({ adapter });
// }

// declare const globalThis: {
//     prismaGlobal: ReturnType<typeof prismaClientSingleton>;
// } & typeof global;
// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// export default prisma;
// if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

                // import "dotenv/config";
                // import { PrismaPg } from '@prisma/adapter-pg'
                // import { PrismaClient } from './generated/prisma/client'

                // const connectionString = `${process.env.DATABASE_URL}`

                // const adapter = new PrismaPg({ connectionString })
                // const prisma = new PrismaClient({ adapter })   

                // export { prisma }

// import { PrismaClient } from "./generated/prisma/client"
// import { withAccelerate } from "@prisma/extension-accelerate"
 
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
// export const prisma =
//   globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())
 
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma


import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma