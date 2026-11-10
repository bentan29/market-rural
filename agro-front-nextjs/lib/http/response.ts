//- Lee el cuerpo UNA sola vez y solo si es JSON; si no, devuelve null
export async function readJson<T = unknown>(res: Response): Promise<T | null> {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  if (!isJson) return null
  return (await res.json().catch(() => null)) as T | null
}

//- Nest manda `message` como string o como arreglo (validaciones): devolvemos un texto
export function extractMessage(body: unknown): string | undefined {
  const message = (body as { message?: string | string[] } | null)?.message
  return Array.isArray(message) ? message[0] : message
}