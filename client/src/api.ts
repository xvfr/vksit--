import axios from 'axios'

const api = axios.create({
	baseURL : import.meta.env.VITE_API_BASE_URI
})

export default api