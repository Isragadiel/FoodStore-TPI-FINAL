import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: 15000,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
