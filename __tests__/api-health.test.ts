import { GET } from '@/app/api/health/route'

describe('API Route - /api/health', () => {
  it('returns healthy status', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.service).toBe('aiops-demo-todo-app')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('version')
  })

  it('includes correct service name', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.service).toBe('aiops-demo-todo-app')
  })

  it('includes version information', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.version).toBe('1.0.0')
  })

  it('includes ISO timestamp', async () => {
    const response = await GET()
    const data = await response.json()

    // Verify timestamp is valid ISO format
    const timestamp = new Date(data.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })
})
