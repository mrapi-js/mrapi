import express from 'express'
import Recover from './Recover'
import dal from '../dal'
export default [
    //获取路由列表
    {
        method: 'GET',
        url: `/router/list`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            const routes = dal.server.app._router.stack
            let list = []
            for (let item of routes) {
                console.log(item)
                list.push({
                    name: item.name,
                    path: item.path,
                    regexp: item.regexp
                })
            }
            return list
        })
    },
]