import { NextRequest, NextResponse } from 'next/server'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: string
}

// In-memory storage (in production, use a database)
let todos: Todo[] = [
  {
    id: 1,
    text: 'Set up Jenkins pipeline',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    text: 'Configure GitHub webhooks',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    text: 'Collect build logs for AIOps',
    completed: false,
    createdAt: new Date().toISOString(),
  },
]

let nextId = 4

// GET /api/todos - Get all todos
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      todos: todos,
      count: todos.length,
    })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Todo text is required' },
        { status: 400 }
      )
    }

    const newTodo: Todo = {
      id: nextId++,
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    todos.push(newTodo)

    return NextResponse.json({
      success: true,
      todo: newTodo,
      message: 'Todo created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}

// DELETE /api/todos - Delete all todos
export async function DELETE() {
  try {
    todos = []
    nextId = 1
    return NextResponse.json({
      success: true,
      message: 'All todos deleted',
    })
  } catch (error) {
    console.error('Error deleting todos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete todos' },
      { status: 500 }
    )
  }
}
