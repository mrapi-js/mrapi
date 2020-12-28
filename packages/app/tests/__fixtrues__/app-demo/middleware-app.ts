import { App } from '../../../src'
export const middlewareApp=new App()
middlewareApp.get('/sub',(_req,res)=>{
    res.send('test sub')
})
export default middlewareApp