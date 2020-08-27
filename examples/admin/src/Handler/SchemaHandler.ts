import express from 'express'
import multer from 'multer'
import Recover from './Recover'
import * as fs from 'fs'
import assert from 'assert'
var upload = multer().single('file')
const uploadPromise = (req: express.Request, res: express.Response) => {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        upload(req, res, function (err) {
            //@ts-ignore
            if (fs.existsSync(`config/prisma/${req.file.originalname}`)) {
                resolve({ code: 1, msg: "file exist" })
                return
            }
            //@ts-ignore
            fs.writeFile(`config/prisma/${req.file.originalname}`, req.file.buffer, (err) => {
                if (err) throw err;
                //@ts-ignore
                console.log(`config/prisma/${req.file.originalname} saved`);
            })
            resolve({ code: 0 })
        })
    })
}
export default [
    //schema 列表
    {
        method: 'GET',
        url: `/schema/list`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            const files = await fs.readdirSync('config/prisma')
            assert(files.length > 0, "do not exist .schema file")
            let arr = []
            for (let item of files) {
                let info = fs.statSync(`config/prisma/${item}`);
                arr.push({
                    name: item,
                    ctime: info.ctime,
                    mtime: info.mtime,
                    birthtime: info.birthtime,
                    size: info.size
                })
            }
            return arr
        })
    },
    //获取某个schema的文件内容
    {
        method: 'GET',
        url: `/schema/get/:name`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            const content = await fs.readFileSync(`config/prisma/${req.params.name}`, 'utf-8')
            return content
        })
    },
    //更新某个schema 内容
    {
        method: 'POST',
        url: `/schema/update/:name`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            assert(fs.existsSync(`config/prisma/${req.params.name}`), "file is not exist")
            await fs.writeFileSync(`config/prisma/${req.params.name}`, req.body.content, 'utf-8')
            return "ok"
        })
    },
    //删除某个schema 内容
    {
        method: 'GET',
        url: `/schema/delete/:name`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            assert(fs.existsSync(`config/prisma/${req.params.name}`), "file is not exist")
            fs.unlinkSync(`config/prisma/${req.params.name}`);
            return "ok"
        })
    },
    //上传schema 文件
    {
        method: 'POST',
        url: `/schema/upload`,
        //upload: upload.single('file'),
        handler: Recover(async (req: express.Request, res: express.Response) => {
            const r=await uploadPromise(req, res)
           //@ts-ignore
            assert(r.code==0,r.msg)
            return "ok"
        })
    },
    //创建schema 文件
    {
        method: 'POST',
        url: `/schema/create/:name`,
        handler: Recover(async (req: express.Request, res: express.Response) => {
            assert(!fs.existsSync(`config/prisma/${req.params.name}`), "file is exist")
            await fs.writeFileSync(`config/prisma/${req.params.name}`, req.body.content, 'utf-8')
            return "ok"
        })
    },
]
