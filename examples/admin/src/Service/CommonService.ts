
import * as fs from 'fs'
export const GetPrismaClientName= async function(){
    let files =new Array()
    try{
     files= await fs.readdirSync('node_modules/.prisma-mrapi')
    }catch(err){

    }
    return files
}