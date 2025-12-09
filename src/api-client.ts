import { API_BASE_URL } from '@/constants'
import type { Category, StudentSubmission } from '@/types'

export type AuthToken = string

export interface LoginRequest {
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface CheckSubmissionQuotaResponse {
  canSubmit: boolean
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[] | Record<string, string | string[]>
  error?: string
  timestamp: string
}

export class ApiError extends Error {
  readonly statusCode: number

  readonly body: ApiErrorResponse | null

  constructor(statusCode: number, message: string, body: ApiErrorResponse | null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.body = body
  }
}

export interface CreateSubmissionRequest {
  studentName: string
  grade: number
  classNumber: number
  category: Category
  workTitle: string
  file: File
}

function extractErrorMessage(body: ApiErrorResponse): string {
  if (typeof body.message === 'string') {
    return body.message
  }

  if (Array.isArray(body.message)) {
    return body.message.join('; ')
  }

  const values = Object.values(body.message)

  if (values.length === 0) {
    return 'Request failed'
  }

  const first = values[0]

  if (Array.isArray(first)) {
    return first.join('; ')
  }

  return first
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  const data = (await response.json()) as T | ApiErrorResponse

  if (!response.ok) {
    const errorBody = data as ApiErrorResponse
    throw new ApiError(response.status, extractErrorMessage(errorBody), errorBody)
  }

  return data as T
}

async function requestBlob(path: string, init: RequestInit): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    const contentType = response.headers.get('content-type')

    if (contentType !== null && contentType.includes('application/json')) {
      const body = (await response.json()) as ApiErrorResponse
      throw new ApiError(response.status, extractErrorMessage(body), body)
    }

    throw new ApiError(response.status, 'Request failed', null)
  }

  return response.blob()
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function createSubmission(
  payload: CreateSubmissionRequest,
): Promise<StudentSubmission> {
  const formData = new FormData()
  formData.append('studentName', payload.studentName)
  formData.append('grade', String(payload.grade))
  formData.append('classNumber', String(payload.classNumber))
  formData.append('category', payload.category)
  formData.append('workTitle', payload.workTitle)
  formData.append('file', payload.file)

  return requestJson<StudentSubmission>('/submissions', {
    method: 'POST',
    body: formData,
  })
}

function buildAuthHeaders(token: AuthToken): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
}

export async function getSubmissions(token: AuthToken): Promise<StudentSubmission[]> {
  return requestJson<StudentSubmission[]>('/submissions', {
    method: 'GET',
    headers: buildAuthHeaders(token),
  })
}

export async function getFinalSubmissions(token: AuthToken): Promise<StudentSubmission[]> {
  return requestJson<StudentSubmission[]>('/submissions/final', {
    method: 'GET',
    headers: buildAuthHeaders(token),
  })
}

export async function downloadSubmissionFile(id: string, token: AuthToken): Promise<Blob> {
  return requestBlob(`/submissions/${encodeURIComponent(id)}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function checkDailySubmission(
  studentName: string,
): Promise<CheckSubmissionQuotaResponse> {
  const params = new URLSearchParams({ studentName })

  return requestJson<CheckSubmissionQuotaResponse>(`/submissions/check?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
}

export function getUploadUrl(storedFileName: string): string {
  const encoded = encodeURIComponent(storedFileName)
  return `${API_BASE_URL}/uploads/${encoded}`
}

