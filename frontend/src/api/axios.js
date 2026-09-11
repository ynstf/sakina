import axios from 'axios';

const API = axios.create({
    baseURL: 'http://84.8.219.196:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default API;