import request from '../utils/request';
export const serverInfo = () => {
    return request({
        url: '/server/info',
        method: 'get',
     //   params: query
    });
};

export const serverStart = () => {
    return request({
        url: '/server/start',
        method: 'get',
     //   params: query
    });
};

export const serverStop = () => {
    return request({
        url: '/server/stop',
        method: 'get',
     //   params: query
    });
};