import Axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios'
/* axios各类型说明
// 请求配置
interface AxiosRequestConfig {
  url?: string
  method?: Method
  baseURL?: string
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  headers?: any
  params?: any
  paramsSerializer?: (params: any) => string
  data?: any
  timeout?: number
  timeoutErrorMessage?: string
  withCredentials?: boolean
  adapter?: AxiosAdapter
  auth?: AxiosBasicCredentials
  responseType?: ResponseType
  xsrfCookieName?: string
  xsrfHeaderName?: string
  onUploadProgress?: (progressEvent: any) => void
  onDownloadProgress?: (progressEvent: any) => void
  maxContentLength?: number
  validateStatus?: ((status: number) => boolean) | null
  maxBodyLength?: number
  maxRedirects?: number
  socketPath?: string | null
  httpAgent?: any
  httpsAgent?: any
  proxy?: AxiosProxyConfig | false
  cancelToken?: CancelToken
  decompress?: boolean
  transitional?: TransitionalOptions
}

// 请求实例
interface AxiosInstance {
  (config: AxiosRequestConfig): AxiosPromise;
  (url: string, config?: AxiosRequestConfig): AxiosPromise;
  defaults: AxiosRequestConfig;
  interceptors: {
    request: AxiosInterceptorManager;
    response: AxiosInterceptorManager;
  };
  getUri(config?: AxiosRequestConfig): string;
  request> (config: AxiosRequestConfig): Promise;
  get>(url: string, config?: AxiosRequestConfig): Promise;
  delete>(url: string, config?: AxiosRequestConfig): Promise;
  head>(url: string, config?: AxiosRequestConfig): Promise;
  options>(url: string, config?: AxiosRequestConfig): Promise;
  post>(url: string, data?: any, config?: AxiosRequestConfig): Promise;
  put>(url: string, data?: any, config?: AxiosRequestConfig): Promise;
  patch>(url: string, data?: any, config?: AxiosRequestConfig): Promise;
}

// 
interface AxiosStatic extends AxiosInstance {
  create(config?: AxiosRequestConfig): AxiosInstance;
  Cancel: CancelStatic;
  CancelToken: CancelTokenStatic;
  isCancel(value: any): boolean;
  all(values: (T | Promise)[]): Promise;
  spread(callback: (...args: T[]) => R): (array: T[]) => R;
  isAxiosError(payload: any): payload is AxiosError;
}

// 请求结果
interface AxiosResponse  {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}

// 请求错误
interface AxiosError extends Error {
  config: AxiosRequestConfig;
  code?: string;
  request?: any;
  response?: AxiosResponse;
  isAxiosError: boolean;
  toJSON: () => object;
}
*/

export namespace axios {
  export const describe: string = 'axios请求封装'
  export class Request {
    // 先创建一个类，给类添加1个属性 instance代表axios的实例  构造函数传递配置 config配置比如全局的baseURL timeout
    // 限制创建的实例必须是axios的实例
    private instance: AxiosInstance
    // 这个config是不能乱写的，axios对创建的配置有限制的
    constructor(config?: AxiosRequestConfig) {
      this.instance = Axios.create({
        // 请求延迟时间 如果超过这个时间就会断开拦截
        timeout: 30000,
        withCredentials: true,
        headers: {
          // 一般会请求拦截里面加token
          Authorization: sessionStorage.getItem('token') || localStorage.getItem('token'),
          Authorize: sessionStorage.getItem('token') || localStorage.getItem('token')
        },
        ...config
      })
      // 接下来配置axios实例身上的全局配置，比如拦截器
      this.instance.interceptors.request.use(
        (config: AxiosRequestConfig): any => {
          // 是否要在请求发出前干点什么？
          return config
        },
        (error: AxiosError) => {
          // 请求出错要做什么处理？
          return Promise.reject(error)
        }
      )
      this.instance.interceptors.response.use(
        (response: AxiosResponse) => {
          return response
        },
        (error: AxiosError) => {
          this._showMessage(error.response.status)
          return Promise.reject(error)
        }
      )
    }
    // 组合错误信息
    private _showMessage(status: number | string): string {
      let message: string = ''
      switch (status) {
        case 400:
          message = '请求错误(400)'
          break
        case 401:
          message = '未授权，请重新登录(401)'
          break
        case 403:
          message = '拒绝访问(403)'
          break
        case 404:
          message = 'NOT FIND'
          break
        case 408:
          message = '请求超时(408)'
          break
        case 500:
          message = '服务器错误(500)'
          break
        case 501:
          message = '服务未实现(501)'
          break
        case 502:
          message = '网络错误(502)'
          break
        case 503:
          message = '服务不可用(503)'
          break
        case 504:
          message = '网络超时(504)'
          break
        case 505:
          message = 'HTTP版本不受支持(505)'
          break
        default:
          message = `连接出错(${status})!`
      }
      return `${message}，请检查网络或联系管理员！`
    }
    // 公共方法，因为不知道返回值的类型
    private requestData<T>(options: AxiosRequestConfig): Promise<T> {
      // 将私有的instance上面发请求的操作，封装到这个实例方法request中，这个方法的返回值应该是一个promise对象
      return new Promise((resolve, reject) => {
        this.instance
          .request<any, T>(options)
          .then(res => {
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
    // 调用上面封装的实例方法requestData，来实现get / post / delete / put 方法的快捷调用
    public getX<T>(options: AxiosRequestConfig): Promise<T> {
      return this.requestData<T>({ ...options, method: 'GET' })
    }
    public postX<T>(options: AxiosRequestConfig): Promise<T> {
      return this.requestData({ ...options, method: 'POST' })
    }
    public putX<T>(options: AxiosRequestConfig): Promise<T> {
      return this.requestData({ ...options, method: 'PUT' })
    }
    public deleteX<T>(options: AxiosRequestConfig): Promise<T> {
      return this.requestData({ ...options, method: 'DELETE' })
    }

    // 封装一个request方法 实现 get / post 复合调用
    private request(url: string, method: string, data: any = {}, headers: any = {}, responseType?: any) {
      const d: any = {
        url,
        method,
        headers: {
          ...headers
        },
        responseType
      }
      method === 'GET' && (d.params = data)
      method === 'POST' && (d.data = data)
      return this.instance(d)
    }
    // 封装get方法 复合调用
    public get(url: string, data: any = {}, loading: boolean | undefined, headers: any, responseType: any) {
      // data.t = new Date().getTime()
      return this.request(url, 'GET', data, headers, responseType)
    }
    // 封装post方法
    public post(url: string, data: any = {}, loading: boolean | undefined, headers?: any) {
      // 映射headers不同类型请求方式
      const map: any = {
        'multipart/form-data': this._json2Formdata
      }
      // 根据请求方式不同，格式化对应数据
      data = map?.[headers?.['Content-Type']] ? map[headers['Content-Type']](data) : data
      return this.request(url, 'POST', data, headers)
    }
    // 针对post方法 headers为表单提交时，进行format data格式化
    private _json2Formdata(dataForm?: { [key: string]: any }) {
      const formdata = new FormData()
      for (const key in dataForm) {
        if (Object.prototype.hasOwnProperty.call(dataForm, key)) {
          const objItem = dataForm[key]
          formdata.append(key, objItem)
        }
      }
      return formdata
    }
  }

  /**
   * 请求参数类型
   */
  export type RequestData = {
    /**请求地址 */
    url: string
    /**请求数据 */
    data?: any
    /**等待状态 */
    loading?: boolean | undefined
    /**请求头 */
    headers?: any
    /**请求类型 */
    responseType?: any
  }

  /**
   * @description get 请求
   * @param {RequestData} req -
   * @return {*}
   * @example
   * ```ts
   *
   * ```
   */
  export const aGet = (req: RequestData): Promise<AxiosResponse<any, any>> => {
    let request = new Request()
    return request.get(req.url, req?.data, req?.loading, req?.headers, req?.responseType)
  }

  /**
   * @description post 请求
   * @param {RequestData} req -
   * @return {*}
   * @example
   * ```ts
   *
   * ```
   */
  export const aPost = (req: RequestData): Promise<AxiosResponse<any, any>> => {
    let request = new Request()
    return request.post(req.url, req?.data, req?.loading, req?.headers)
  }
}
