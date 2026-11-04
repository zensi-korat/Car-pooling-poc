// The single door: the rest of the app imports from '@/services/api' only.
export { api, setSessionExpiredHandler } from './axiosClient'
export { ApiError } from './ApiError'
export type { ApiOptions } from './ApiError'
export { getErrorMessage } from './getErrorMessage'
