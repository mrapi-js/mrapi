import express from 'express'
import Recover from './Recover'
import assert from 'assert'
import dal from '../dal'
export default [
    //获取路由列表
    {
        method: 'GET',
        url: `/router/list`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            assert(dal.server,"server is not running")
            assert(dal.server.app._router,"no routers")
            console.log(dal.server.app)
            const routes = dal.server.app._router.stack
            let list = []
            for (let item of routes) {
               
                list.push({
                    name: item.name,
                    path: item.path,
                    regexp: item.regexp.toString()
                })
            }
            return list
        })
    },
    {
        method: 'get',
        url: `/router/add/:name`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            assert(dal.server,"start server first")
            assert(req.params.name,"params error")
            const name=req.params.name.split('.')[0]
            const routes = dal.server.app._router.stack
            let isOk=false
            for (let item of routes) {
                  
                    if(item.regexp.test(`/graphql/${name}`)){
                        isOk=true
                        break
                    }
            }
            if(isOk){//更新路由
                dal.removeSchema(name)
            }
            dal.addSchema(name)
            return "ok"
        })
    },
    {
        method: 'delete',
        url: `/router/remove`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            const routes = dal.server.app._router.stack
             let isOk=false
            for (let item of routes) {
                console.log(item)
                if(item.regexp.toString()===req.query.name){
                    isOk=true
                    break
                }
            }

           return "ok"//dal.removeSchema(req.params.name)
        })
    },
]