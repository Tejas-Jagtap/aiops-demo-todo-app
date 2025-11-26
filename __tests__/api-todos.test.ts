import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '@/app/api/todos/route'

describe('API Route - /api/todos', () => {
  describe('GET /api/todos', () => {
    it('returns all todos successfully', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.todos)).toBe(true)
      expect(data.count).toBeGreaterThanOrEqual(0)
    })

    it('returns default todos on first load', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.todos.length).toBeGreaterThanOrEqual(3)
      expect(data.todos[0]).toHaveProperty('id')
      expect(data.todos[0]).toHaveProperty('text')
      expect(data.todos[0]).toHaveProperty('completed')
      expect(data.todos[0]).toHaveProperty('createdAt')
    })
  })

  describe('POST /api/todos', () => {
    it('creates a new todo successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text: 'Test todo item' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.todo.text).toBe('Test todo item')
      expect(data.todo.completed).toBe(false)
      expect(data.todo).toHaveProperty('id')
      expect(data.todo).toHaveProperty('createdAt')
    })

    it('rejects empty todo text', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text: '' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Todo text is required')
    })

    it('rejects todo without text field', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('trims whitespace from todo text', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text: '  Test with spaces  ' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.todo.text).toBe('Test with spaces')
    })
  })

  describe('DELETE /api/todos', () => {
    it('deletes all todos successfully', async () => {
      const response = await DELETE()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('All todos deleted')
    })

    it('returns empty list after deletion', async () => {
      await DELETE()
      const response = await GET()
      const data = await response.json()

      expect(data.todos.length).toBe(0)
    })
  })
})
