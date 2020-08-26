
export class ResponseData<T>{
    constructor(code?: number, data?: T, msg?: string) {
      this.code = code
      this.data = data
      this.msg = msg
    }
    code?: number
    msg?: string
    data?: T
  }