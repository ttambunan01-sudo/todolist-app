import React, { useState, useEffect } from 'react';
import { todoApi } from '../services/api';
import './TodoList.css';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.getAllTodos();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todoData = {
        title: newTodo,
        completed: false,
        priority: 'MEDIUM',
      };
      const createdTodo = await todoApi.createTodo(todoData);
      setTodos([...todos, createdTodo]);
      setNewTodo('');
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todo.id, {
        title: todo.title,
        description: todo.description,
        completed: !todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate,
        tags: todo.tags,
      });
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  const handleSaveEdit = async (todo) => {
    if (!editingText.trim()) return;

    try {
      const updatedTodo = await todoApi.updateTodo(todo.id, {
        title: editingText,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate,
        tags: todo.tags,
      });
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="todo-container"><div className="loading">Loading todos...</div></div>;
  }

  return (
    <div className="todo-container">
      <h1>Todo List</h1>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-message">No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo)}
                className="todo-checkbox"
              />

              {editingId === todo.id ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="edit-input"
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(todo)} className="save-btn">Save</button>
                  <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                </div>
              ) : (
                <>
                  <span className="todo-text" onClick={() => handleToggleTodo(todo)}>
                    {todo.title}
                  </span>
                  <div className="todo-actions">
                    <button onClick={() => handleStartEdit(todo)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDeleteTodo(todo.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="todo-stats">
        <p>Total: {todos.length} | Completed: {todos.filter(t => t.completed).length} | Active: {todos.filter(t => !t.completed).length}</p>
      </div>
    </div>
  );
}

export default TodoList;
