import express from 'express'
import Recover from './Recover'
export default[
    {
        method: 'POST',
        url: `/account/list`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
            return "OK"
        })
    },
    {
        method: 'GET',
        url: `/test`,
        handler:Recover(async (req:express.Request,res:express.Response)=>{
            
            return "OK"
        })
    }

]