const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = 5001; // ✅ Hardcoded to always use 5001

// Debug environment variables loading
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'loaded' : 'missing');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// GET /todos
app.get('/todos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      return res.status(500).json({ error: 'Failed to fetch todos' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /todos
app.post('/todos', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([
        {
          title,
          description: description || '',
          completed: false,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Error creating todo:', error);
      return res.status(500).json({ error: 'Failed to create todo' });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /todos/:id
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return res.status(500).json({ error: 'Failed to delete todo' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /todos/:id
app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const { data, error } = await supabase
      .from('todos')
      .update({
        title,
        description,
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating todo:', error);
      return res.status(500).json({ error: 'Failed to update todo' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /summarize
app.post('/summarize', async (req, res) => {
  try {
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('completed', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      return res.status(500).json({ error: 'Failed to fetch todos' });
    }

    if (!todos || todos.length === 0) {
      return res.status(400).json({ error: 'No pending todos to summarize' });
    }

    const todosText = todos.map(todo =>
      `- ${todo.title}${todo.description ? `: ${todo.description}` : ''}`
    ).join('\n');

    const prompt = `Please provide a concise summary of the following pending todo items. Focus on the main themes, priorities, and provide actionable insights:

${todosText}

Provide a summary that includes:
1. Total number of pending tasks
2. Main categories or themes
3. Any urgent or important items
4. A brief motivational note`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes todo lists in a concise and actionable way."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhookUrl) {
      return res.status(400).json({ error: 'Slack webhook URL not configured' });
    }

    const slackMessage = {
      text: "📋 Todo Summary",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📋 Todo Summary Assistant"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: summary
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Generated on ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    await axios.post(slackWebhookUrl, slackMessage);

    res.json({
      success: true,
      message: 'Summary generated and sent to Slack successfully',
      summary: summary
    });

  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    res.status(500).json({
      error: 'Failed to generate summary or send to Slack',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
