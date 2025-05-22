const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// Todo CRUD routes
router.get('/todos', todoController.getAllTodos);
router.post('/todos', todoController.createTodo);
router.put('/todos/:id', todoController.updateTodo);
router.delete('/todos/:id', todoController.deleteTodo);

// AI Summarization and Slack integration route
router.post('/summarize', todoController.summarizeAndSendToSlack);

// API documentation route
router.get('/', (req, res) => {
    res.json({
        message: 'Todo Summary Assistant API',
        version: '1.0.0',
        endpoints: {
            'GET /todos': 'Fetch all todos',
            'POST /todos': 'Create a new todo',
            'PUT /todos/:id': 'Update a todo',
            'DELETE /todos/:id': 'Delete a todo',
            'POST /summarize': 'Generate AI summary and send to Slack'
        },
        example_requests: {
            create_todo: {
                method: 'POST',
                url: '/api/todos',
                body: {
                    title: 'Complete project',
                    description: 'Finish the todo app assignment'
                }
            },
            summarize: {
                method: 'POST',
                url: '/api/summarize',
                description: 'Generates AI summary of pending todos and sends to Slack'
            }
        }
    });
});

module.exports = router;