import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";

// Mock fetch
global.fetch = jest.fn();

describe("Home Page - Todo App", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockReset();
  });

  it("renders the main heading", () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: [] }),
    });

    render(<Home />);
    const heading = screen.getByText(/AIOps Demo Todo App/i);
    expect(heading).toBeInTheDocument();
  });

  it("renders the subtitle with pipeline information", () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: [] }),
    });

    render(<Home />);
    const subtitle = screen.getByText(/Jenkins Pipeline Testing/i);
    expect(subtitle).toBeInTheDocument();
  });

  it("loads todos from API on mount", async () => {
    const mockTodos = [
      { id: 1, text: "Test todo", completed: false, createdAt: "2024-01-01" },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: mockTodos }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Test todo")).toBeInTheDocument();
    });
  });

  it("displays empty state when no todos", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: [] }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();
    });
  });

  it("shows correct todo counts in filter buttons", async () => {
    const mockTodos = [
      { id: 1, text: "Active todo", completed: false, createdAt: "2024-01-01" },
      {
        id: 2,
        text: "Completed todo",
        completed: true,
        createdAt: "2024-01-02",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: mockTodos }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/All \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Active \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed \(1\)/i)).toBeInTheDocument();
    });
  });

  it("renders input field and add button", () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: [] }),
    });

    render(<Home />);

    const input = screen.getByPlaceholderText(/What needs to be done/i);
    const addButton = screen.getByText("Add");

    expect(input).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
  });

  it("adds a new todo when add button is clicked", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ todos: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          todo: {
            id: 1,
            text: "New todo",
            completed: false,
            createdAt: "2024-01-01",
          },
        }),
      });

    render(<Home />);

    const input = screen.getByPlaceholderText(/What needs to be done/i);
    const addButton = screen.getByText("Add");

    fireEvent.change(input, { target: { value: "New todo" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/todos",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("does not add empty todos", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: [] }),
    });

    render(<Home />);

    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);

    // Should not call POST if input is empty
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial GET
  });

  it("filters todos by active status", async () => {
    const mockTodos = [
      { id: 1, text: "Active todo", completed: false, createdAt: "2024-01-01" },
      {
        id: 2,
        text: "Completed todo",
        completed: true,
        createdAt: "2024-01-02",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: mockTodos }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Active todo")).toBeInTheDocument();
    });

    const activeButton = screen.getByText(/Active \(1\)/i);
    fireEvent.click(activeButton);

    expect(screen.getByText("Active todo")).toBeInTheDocument();
    expect(screen.queryByText("Completed todo")).not.toBeInTheDocument();
  });

  it("filters todos by completed status", async () => {
    const mockTodos = [
      { id: 1, text: "Active todo", completed: false, createdAt: "2024-01-01" },
      {
        id: 2,
        text: "Completed todo",
        completed: true,
        createdAt: "2024-01-02",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: mockTodos }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Completed todo")).toBeInTheDocument();
    });

    const completedButton = screen.getByText(/Completed \(1\)/i);
    fireEvent.click(completedButton);

    expect(screen.getByText("Completed todo")).toBeInTheDocument();
    expect(screen.queryByText("Active todo")).not.toBeInTheDocument();
  });
});
