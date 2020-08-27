import request from '../utils/request';

export const schemaList = query => {
    return request({
        url: '/schema/list',
        method: 'get',
       // params: query
    });
};
export const schemaGet= name => {
    return request({
        url: '/schema/get/'+name,
        method: 'get',
       // params: query
    });
};

export const schemaUpdate= (name,data) => {
    return request({
        url: '/schema/update/'+name,
        method: 'post',
        data
    });
};
///schema/delete/
export const schemaDelete= (name) => {
    return request({
        url: '/schema/delete/'+name,
        method: 'get',
    });
};

export const schemaCreate= (name,data) => {
    return request({
        url: '/schema/create/'+name,
        method: 'post',
        data
    });
};