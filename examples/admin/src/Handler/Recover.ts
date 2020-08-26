import express from 'express'
import{ ResponseData} from '../models/ResponeData'
export type HandlerFunc<T> = (req: express.Request,res:express.Response) => Promise<T>;

export default function Recover<T>(handler: HandlerFunc<T>): HandlerFunc<ResponseData<T>> {
    return async (req: express.Request,res:express.Response) => {
        try {
            let result = await handler(req,res)
            res.send(new ResponseData<T>(0, result))
            return new ResponseData<T>(0, result)
        } catch (err) {
            res.send(new ResponseData<T>(1, undefined, err?.message ?? err))
            return new ResponseData<T>(1, undefined, err?.message ?? err)
        }
    }
}