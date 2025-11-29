import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the TodoList component to avoid API calls in App test
jest.mock('./components/TodoList', () => {
  return function MockTodoList() {
    return <div data-testid="todo-list-mock">TodoList Component</div>;
  };
});

test('renders App component', () => {
  render(<App />);
  const appElement = screen.getByTestId('todo-list-mock');
  expect(appElement).toBeInTheDocument();
});
