const pool = require('../config/database');
const openaiService = require('../services/openaiService');
const slackService = require('../services/slackService');

// Get all todos
const getAllTodos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};

// Add new todo
const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await pool.query(
            'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
            [title.trim(), description ? description.trim() : '']
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

// Update todo
const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed } = req.body;
        
        // Check if todo exists
        const existingTodo = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        if (existingTodo.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const result = await pool.query(
            'UPDATE todos SET title = $1, description = $2, completed = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [title.trim(), description ? description.trim() : '', completed, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
};

// Delete todo
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ message: 'Todo deleted successfully', deletedTodo: result.rows[0] });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};

// Summarize todos and send to Slack
const summarizeAndSendToSlack = async (req, res) => {
    try {
        console.log('🤖 Starting todo summarization process...');
        
        // Get all pending todos
        const result = await pool.query('SELECT * FROM todos WHERE completed = false ORDER BY created_at DESC');
        const pendingTodos = result.rows;
        
        if (pendingTodos.length === 0) {
            return res.json({ 
                message: 'No pending todos to summarize',
                pendingCount: 0
            });
        }

        console.log(`📝 Found ${pendingTodos.length} pending todos`);
        
        // Generate summary using OpenAI
        console.log('🧠 Generating AI summary...');
        const summary = await openaiService.generateSummary(pendingTodos);
        
        // Send to Slack
        console.log('📤 Sending summary to Slack...');
        await slackService.sendToSlack(summary, pendingTodos.length);
        
        console.log('✅ Summary process completed successfully');
        
        res.json({ 
            message: 'Summary generated and sent to Slack successfully',
            summary: summary,
            pendingTodosCount: pendingTodos.length
        });
    } catch (error) {
        console.error('❌ Error in summarize and send:', error);
        
        // More specific error messages
        let errorMessage = 'Failed to summarize and send to Slack';
        if (error.message.includes('OpenAI')) {
            errorMessage = 'Failed to generate AI summary. Please check your OpenAI API key.';
        } else if (error.message.includes('Slack')) {
            errorMessage = 'Failed to send message to Slack. Please check your webhook URL.';
        }
        
        res.status(500).json({ error: errorMessage, details: error.message });
    }
};

module.exports = {
    getAllTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    summarizeAndSendToSlack
};