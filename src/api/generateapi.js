import axios from "axios"

const generalUrl = "http://localhost:5078/api/";


export const apiClient = axios.create({
  baseURL: generalUrl,
  timeout: 2000,
  headers: {
  Authorization: localStorage.getItem('token')
    ? `Bearer ${localStorage.getItem('token')}`
    : ''
}
});

