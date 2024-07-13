import axios from 'axios';

const api = axios.create({
  // development
  baseURL: 'http://127.0.0.1:8000',
  //production
  // baseURL: 'https://4uhnyf.skill17.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

export default api;