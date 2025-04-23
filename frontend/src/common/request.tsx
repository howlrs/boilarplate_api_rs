import axios, { AxiosResponse } from 'axios';


const createUrl = (path: string, query?: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return query ? `${baseUrl}${path}?${query}` : `${baseUrl}${path}`;
};

/**
 * @description: A function to send a GET request to the server.
 * @param {string} path - The API endpoint path.
 * @param {string} [query] - Optional query string parameters.
 * @returns {Promise<AxiosResponse<any>>} - A promise that resolves to the response of the GET request.
 */
export const get = async (path: string, query?: string): Promise<AxiosResponse<any>> => {
    const url = createUrl(path, query);
    try {
        let headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        if (localStorage.getItem('token')) {
            headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }

        const response = await axios.get(url, {
            headers: headers,
        });
        return response;
    } catch (error) {
        throw new Error(`GET request failed: ${error}`);
    }
}

/**
 * @description: A function to send a POST request to the server.
 * @param {string} path - The API endpoint path.
 * @param {any} data - The data to be sent in the request body.
 * @param {string} [query] - Optional query string parameters.
 * @returns {Promise<AxiosResponse<any>>} - A promise that resolves to the response of the POST request.
 */
export const post = async (path: string, data: any, query?: string): Promise<AxiosResponse<any>> => {
    const url = createUrl(path, query);
    try {
        let headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        if (localStorage.getItem('token')) {
            headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }

        const response = await axios.post(url, data, {
            headers: headers,
        });
        return response;
    } catch (error) {
        throw new Error(`POST request failed: ${error}`);
    }
}