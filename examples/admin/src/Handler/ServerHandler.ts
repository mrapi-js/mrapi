import express from 'express'
import Recover from './Recover'
import dal from '../dal'
import assert from 'assert'
import {GetPrismaClientName }from '../Service/CommonService'
var net=require('net')
const portIsOccupied=(port:number)=>{
    return new Promise((resolve, reject) => {
        var server=net.createServer().listen(port)
        server.on('listening',function(){
            server.close()
            resolve(false)
        })
        server.on('error',function(err){
            if(err.code==='EADDRINUSE'){
                resolve(true)
            }
        })

   })
}
export default[
    {
        method: 'GET',
        url: `/server/start`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
           if(!dal.server){
             dal.start()
             const arr=await  GetPrismaClientName()
             console.log(arr)
             for(let item of arr){
                 dal.addSchema(item)
             }
           }else{
            const status=await portIsOccupied(dal.server.options.port)
            console.log("----",status,dal.server.options.port)
             assert(!status,"server is running")
             //TODO
              dal.start()
          }
            return "OK"
        })
    },
    {
        method: 'GET',
        url: `/server/stop`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
            assert(dal.server,"server is not exist")
            dal.server.stop()
            return "OK"
        })
    },
    {
        method: 'GET',
        url: `/server/info`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
           
             assert(dal.server,"server is not exist，please start server")
            const port=13588//dal.server.options.port
            const status=await portIsOccupied(port)
            console.log(`${port} 使用情况-->${status}`)
            //@ts-ignore
            return {...dal.server.options,serverStatus:!status}
        })
    },
]