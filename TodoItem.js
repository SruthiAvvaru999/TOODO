import React, { useState } from 'react';
import TodoForm from './TodoForm';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    await onUpdate(todo.id, {
      ...todo,
      completed: !todo.completed
    });
  };

  const handleEdit = async (updatedData) => {
    await onUpdate(todo.id, updatedData);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setIsDeleting(true);
      try {
        await onDelete(todo.id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <TodoForm
          initialData={todo}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}>
      <div className="todo-content">
        <div className="todo-header">
          <div className="todo-title-section">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              className="todo-checkbox"
            />
            <h3 className="todo-title">{todo.title}</h3>
          </div>
          
          <div className="todo-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-small btn-edit"
              disabled={isDeleting}
              title="Edit todo"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-small btn-delete"
              disabled={isDeleting}
              title="Delete todo"
            >
              {isDeleting ? '⏳' : '🗑️'}
            </button>
          </div>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-metadata">
          <span className="todo-date">
            Created: {formatDate(todo.created_at)}
          </span>
          {todo.updated_at && todo.updated_at !== todo.created_at && (
            <span className="todo-date">
              Updated: {formatDate(todo.updated_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;