import axios from 'axios'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import https from 'https'
const myagent = new https.Agent({  
  rejectUnauthorized: false
});
const defaultParams:any={
  httpsAgent:myagent,
  NODE_TLS_REJECT_UNAUTHORIZED:'0',
  timeout: 120000
}
export default class Ajax {
  private request(params: AxiosRequestConfig): Promise<any> {
    
    return new Promise((resolve, reject) => {
      axios({...defaultParams,...params})
        .then((res: AxiosResponse) => {
         resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  private queryString(url: string, query?: Record<string, string>): string {
    const str = []
    for (const key in query) {
      str.push(key + '=' + query[key])
    }
    const paramStr = str.join('&')
    return paramStr ? `${url}?${paramStr}` : url
  }

  public get(url = '', params?: Record<string, string>): Promise<any> {
    return this.request({
      method: 'get',
      url: this.queryString(`${url}`, params)
    })
  }

  public post(url: string, params?: Record<string, any>): Promise<any> {
    return this.request({
      method: 'post',
      url: `${url}`,
      data: params
    })
  }
}
