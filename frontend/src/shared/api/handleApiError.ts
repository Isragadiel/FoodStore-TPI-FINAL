import axios from 'axios'

interface ValidationError {
  msg?: string
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item: ValidationError) =>
          item.msg || 'Dato invalido',
        )
        .join('. ')
    }

    if (!error.response) {
      return 'No se pudo conectar con el servidor.'
    }

    if (error.response.status === 403) {
      return 'No tenes permisos para esta operacion.'
    }

    return 'No se pudo completar la operacion.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrio un error inesperado.'
}
