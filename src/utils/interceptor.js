import axios from 'axios';
import { toast } from 'react-toastify';

export const ApiCall = (payload) => {
    const _axios = axios.create();

    if (!payload.baseURL) {
        // eslint-disable-next-line no-undef
        const baseurl = process.env.XRPL_POAP_API_ENDPOINT;
        payload.baseURL = baseurl;
    }

    let axiosPayload = {
        url: payload.url || '',
        method: payload.method || 'get',
        baseURL: payload.baseURL || '',
        headers: payload.headers || {},
        params: payload.params || {},
        data: payload.data || {},
        config: payload.config || {},
        responseType: payload.responseType,
    };

    console.log(
        `[${axiosPayload.method.toUpperCase()}] Request for API:`,
        ' ',
        axiosPayload.baseURL + axiosPayload.url,
        ' ',
        payload
    );

    return new Promise(function (resolve, reject) {
        _axios(axiosPayload)
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                let errorResponse = error.response?.data || error.message;

                if (typeof errorResponse === 'object' && errorResponse.error) {
                    errorResponse = errorResponse.error;
                }
                errorResponse = errorResponse ?? 'Some error occurred';
                toast.error(errorResponse);

                if (errorResponse === 'Invalid Token') {
                    localStorage.clear();
                    window.location.href = window.location.origin;
                }

                reject(error);
            });
    });
};
