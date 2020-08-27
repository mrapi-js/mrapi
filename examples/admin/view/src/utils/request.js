import axios from 'axios';
import { MessageBox, Message } from "element-ui";
const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
     baseURL: '/api',
    timeout: 5000
});

service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if(response.data.code!=0){
                Message({
                    message: response.data.msg || response.data.message || "error",
                    type: "error",
                    duration: 5 * 1000
                  });
                  console.log("request:", response.data.code);
                return Promise.reject(response.data.msg || response.data.message || "error");
                
            }else{
              return response.data.data;
            }
        } else {
            Promise.reject();
        }
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

export default service;
