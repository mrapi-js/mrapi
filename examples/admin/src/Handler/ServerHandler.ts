import express from 'express'
import Recover from './Recover'
import dal from '../dal'
import assert from 'assert'
export default[
    {
        method: 'GET',
        url: `/server/start`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
            dal.start()
            return "OK"
        })
    },
    {
        method: 'GET',
        url: `/server/stop`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
            dal.stop()
            return "OK"
        })
    },
    {
        method: 'GET',
        url: `/server/info`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
            console.log(dal.server)
            assert(dal.server,"server is not exist")
            return dal.server.options
        })
    },
]