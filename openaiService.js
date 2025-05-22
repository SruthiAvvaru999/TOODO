const axios = require('axios');

const generateSummary = async (todos) => {
    try {
        // Format todos for AI processing
        const todoList = todos.map((todo, index) => {
            const createdDate = new Date(todo.created_at).toLocaleDateString();
            return `${index + 1}. **${todo.title}**${todo.description ? `: ${todo.description}` : ''} _(Created: ${createdDate})_`;
        }).join('\n');
        
        const prompt = `Please analyze and summarize the following pending todo items. Provide a well-organized, professional summary that includes:

1. **Overview**: Brief summary of the total number of tasks and their general nature
2. **Priority Assessment**: Identify which tasks seem most urgent or important
3. **Categories**: Group similar tasks together if applicable
4. **Action Plan**: Suggest a logical order or approach for tackling these tasks
5. **Time Estimate**: Provide rough time estimates if possible

**Pending Todo Items:**
${todoList}

Please format your response in a clear, actionable manner that would be helpful for planning and prioritization.`;

        console.log('🤖 Sending request to OpenAI...');
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a highly organized productivity assistant that creates clear, actionable summaries of todo lists. Your summaries help people prioritize and plan their work effectively.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 800,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const summary = response.data.choices[0].message.content;
        console.log('✅ OpenAI summary generated successfully');
        
        return summary;
    } catch (error) {
        console.error('❌ Error generating summary:', error.response?.data || error.message);
        
        // Handle different types of errors
        if (error.response?.status === 401) {
            throw new Error('OpenAI API authentication failed. Please check your API key.');
        } else if (error.response?.status === 429) {
            throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 400) {
            throw new Error('OpenAI API request was invalid. Please check the request format.');
        } else {
            throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }
};

module.exports = {
    generateSummary
};