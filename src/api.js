import axios from 'axios';

const api = axios.create({
  // development
  //baseURL: 'http://127.0.0.1:8000/api/v1',
  // baseURL: 'http://localhost:3000/api/v1',
  // baseURL: 'http://localhost:8080/api/v1',
  baseURL: 'https://backend.test:8443/api/v1/',
  //production
  // baseURL: 'https://4uhnyf.skill17.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

export default api;