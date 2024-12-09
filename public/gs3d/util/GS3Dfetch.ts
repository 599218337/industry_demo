export namespace GS3Dfetch {
  export const describe: string = 'fetch请求封装'
  export async function request(params: any) {
    let url: string = params?.url
    const method: string = params?.method
    const header: any = params?.header
    let data: any = params?.data
    const get_params: any = params?.params
    const get_params_list: Array<any> = []
    if (get_params) {
      for (const item in get_params) {
        get_params_list.push(item + '=' + get_params[item])
      }
      if (url.search(/\?/) === -1) {
        url += '?' + get_params_list.join('&')
      } else {
        url += '&' + get_params_list.join('&')
      }
    }
    if (params?.method?.toLowerCase() == 'POST') {
      data = JSON.stringify(data)
    }
    const headers = {
      'Content-Type': 'application/json',
      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...header
    }
    return await fetch(url, {
      method: method,
      // body: JSON.stringify(data),
      headers: new Headers(headers),
      mode: 'cors',
      credentials: 'omit',
      ...data
    })
      .then(res => {
        return res.json()
      })
      // .then(res => res.status)
      // .then(response => response.json())
      .catch(error => {
        return error
      })
  }
}
