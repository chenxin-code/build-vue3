import axios from 'axios';

const baiduMap = axios.create({ baseURL: '/baiduMap' });

// 请求拦截
baiduMap.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截
baiduMap.interceptors.response.use(
  resp => {
    return resp.data;
  },
  error => {
    return Promise.reject(new Error(error));
  }
);

export default baiduMap;