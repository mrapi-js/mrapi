import express from 'express'
import handler from './Handler/index'
const app = express();
app.use(express.json()) 
app.use(express.static('view/dist'))
console.log(handler)
for(let item of handler){
    
    if(item.method.toUpperCase()=="POST"){
        app.post(item.url,item.handler)
    }else if(item.method.toUpperCase()=="GET"){
        app.get(item.url,item.handler)
    }
    
}
app.listen(13588)
console.log('admin playground  port 13588')