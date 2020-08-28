
import * as fs from 'fs'
export const GetPrismaClientName= async function(){
    const files = await fs.readdirSync('node_modules/.prisma-mrapi')
    return files
}