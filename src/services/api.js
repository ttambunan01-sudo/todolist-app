const BASE_URL = 'http://localhost:8080/api/v1';

export const todoApi = {
  // Get all todos (returns paginated response)
  getAllTodos: async (page = 0, size = 100) => {
    try {
      const response = await fetch(`${BASE_URL}/todos?page=${page}&size=${size}`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const pageData = await response.json();
      // Return the content array from the paginated response
      return pageData.content || [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  // Get a single todo by ID
  getTodoById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/todos/${id}`);
      if (!response.ok) throw new Error('Failed to fetch todo');
      return await response.json();
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  },

  // Create a new todo
  createTodo: async (todoData) => {
    try {
      const response = await fetch(`${BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      if (!response.ok) throw new Error('Failed to create todo');
      return await response.json();
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  // Update a todo
  updateTodo: async (id, todoData) => {
    try {
      const response = await fetch(`${BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      return await response.json();
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  // Delete a todo
  deleteTodo: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      // DELETE returns 204 No Content, so don't try to parse JSON
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },
};
