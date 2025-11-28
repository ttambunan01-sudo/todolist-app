import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from './TodoList';
import { todoApi } from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
  todoApi: {
    getAllTodos: jest.fn(),
    createTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
}));

describe('TodoList Component', () => {
  const mockTodos = [
    {
      id: 1,
      title: 'Test Todo 1',
      completed: false,
      priority: 'MEDIUM',
    },
    {
      id: 2,
      title: 'Test Todo 2',
      completed: true,
      priority: 'HIGH',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    todoApi.getAllTodos.mockImplementation(() => new Promise(() => {}));
    render(<TodoList />);
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  test('renders todo list after loading', async () => {
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    todoApi.getAllTodos.mockRejectedValue(new Error('API Error'));
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load todos/i)).toBeInTheDocument();
    });
  });

  test('renders empty message when no todos', async () => {
    todoApi.getAllTodos.mockResolvedValue([]);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    const newTodo = {
      id: 3,
      title: 'New Todo',
      completed: false,
      priority: 'MEDIUM',
    };

    todoApi.getAllTodos.mockResolvedValue([]);
    todoApi.createTodo.mockResolvedValue(newTodo);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(todoApi.createTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        completed: false,
        priority: 'MEDIUM',
      });
    });
  });

  test('does not add empty todo', async () => {
    todoApi.getAllTodos.mockResolvedValue([]);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);

    expect(todoApi.createTodo).not.toHaveBeenCalled();
  });

  test('toggles todo completion status', async () => {
    const updatedTodo = { ...mockTodos[0], completed: true };
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    todoApi.updateTodo.mockResolvedValue(updatedTodo);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalledWith(1, {
        title: 'Test Todo 1',
        description: undefined,
        completed: true,
        priority: 'MEDIUM',
        dueDate: undefined,
        tags: undefined,
      });
    });
  });

  test('deletes a todo', async () => {
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    todoApi.deleteTodo.mockResolvedValue({});

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(todoApi.deleteTodo).toHaveBeenCalledWith(1);
    });
  });

  test('starts editing a todo', async () => {
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('saves edited todo', async () => {
    const updatedTodo = { ...mockTodos[0], title: 'Updated Todo' };
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    todoApi.updateTodo.mockResolvedValue(updatedTodo);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const editInput = screen.getByDisplayValue('Test Todo 1');
    fireEvent.change(editInput, { target: { value: 'Updated Todo' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Updated Todo',
      }));
    });
  });

  test('cancels editing', async () => {
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  test('displays todo statistics', async () => {
    todoApi.getAllTodos.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/Total: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Completed: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 1/)).toBeInTheDocument();
    });
  });

  test('closes error message', async () => {
    todoApi.getAllTodos.mockRejectedValue(new Error('API Error'));
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load todos/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Failed to load todos/i)).not.toBeInTheDocument();
    });
  });
});
