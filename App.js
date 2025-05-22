import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import SummaryButton from './components/SummaryButton';
import './App.css';

const API_BASE_URL = 'http://localhost:5001';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/todos`);
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos. Please try again.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todoData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, todoData);
      setTodos([response.data, ...todos]);
      setSuccessMessage('Todo added successfully!');
      clearMessages();
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', err);
    }
  };

  const updateTodo = async (id, todoData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, todoData);
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setSuccessMessage('Todo updated successfully!');
      clearMessages();
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      setSuccessMessage('Todo deleted successfully!');
      clearMessages();
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', err);
    }
  };

  const handleSummarize = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/summarize`);
      setSuccessMessage('Summary generated and sent to Slack successfully!');
      setError('');
      clearMessages();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate summary. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
      console.error('Error generating summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccessMessage('');
    }, 5001);
  };

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 Todo Summary Assistant</h1>
        <p>Manage your tasks and get AI-powered summaries sent to Slack</p>
      </header>

      <main className="App-main">
        {/* Messages */}
        {error && (
          <div className="message error-message">
            ❌ {error}
          </div>
        )}

        {successMessage && (
          <div className="message success-message">
            ✅ {successMessage}
          </div>
        )}

        {/* Add Todo Form */}
        <section className="todo-form-section">
          <h2>Add New Todo</h2>
          <TodoForm onSubmit={addTodo} />
        </section>

        {/* Summary Button */}
        <section className="summary-section">
          <SummaryButton 
            onSummarize={handleSummarize}
            disabled={pendingTodos.length === 0 || loading}
            pendingCount={pendingTodos.length}
          />
        </section>

        {/* Todo Lists */}
        <section className="todo-lists">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="todo-list-container">
                <h2>📝 Pending Todos ({pendingTodos.length})</h2>
                <TodoList
                  todos={pendingTodos}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              </div>

              <div className="todo-list-container">
                <h2>✅ Completed Todos ({completedTodos.length})</h2>
                <TodoList
                  todos={completedTodos}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="App-footer">
        <p>Built with React, Node.js, Supabase, OpenAI, and Slack</p>
      </footer>
    </div>
  );
}

export default App;