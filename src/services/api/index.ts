// The single door: the rest of the app imports from '@/services/api' only.
export { api } from './axiosClient'
export { ApiError } from './ApiError'
export type { ApiOptions, FieldErrors } from './ApiError'
export { getErrorMessage } from './getErrorMessage'
