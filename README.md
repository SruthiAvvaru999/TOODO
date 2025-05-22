# Todo Summary Assistant

A full-stack application that helps you manage your todos and generate AI-powered summaries sent directly to Slack. Built with React, Node.js, Supabase, OpenAI, and Slack integration.

![Todo Summary Assistant](https://via.placeholder.com/800x400/667eea/ffffff?text=Todo+Summary+Assistant)

## 🚀 Features

- **Todo Management**: Create, edit, delete, and mark todos as complete
- **AI-Powered Summaries**: Generate intelligent summaries of your pending todos using OpenAI
- **Slack Integration**: Automatically send summaries to your Slack channel
- **Real-time Updates**: Live updates across the application  
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Persistence**: Store todos securely with Supabase

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Axios** - HTTP client for API requests
- **CSS3** - Custom styling with responsive design

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and backend services
- **OpenAI API** - AI-powered text generation
- **Slack Webhooks** - Team communication integration

## 📋 Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- OpenAI API key
- Slack workspace with webhook permissions

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/todo-summary-assistant.git
cd todo-summary-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
PORT=5001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key

# Slack Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Update the `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to the SQL Editor and run this query to create the todos table:

```sql
-- Create todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON todos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

3. Get your project URL and anon key from Settings > API

### 5. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an account and get your API key
3. Make sure you have credits in your account

### 6. Slack Webhook Setup

1. Go to your Slack workspace
2. Create a new app at [Slack API](https://api.slack.com/apps)
3. Go to "Incoming Webhooks" and activate it
4. Click "Add New Webhook to Workspace"
5. Choose the channel where you want to receive summaries
6. Copy the webhook URL

## 🚀 Running the Application

### Development Mode

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend development server:

```bash
cd frontend  
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

Build the frontend:

```bash
cd frontend
npm run build
```

Start the backend in production:

```bash
cd backend
npm start
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | Fetch all todos |
| POST | `/todos` | Create a new todo |
| PUT | `/todos/:id` | Update a todo |
| DELETE | `/todos/:id` | Delete a todo |
| POST | `/summarize` | Generate summary and send to Slack |
| GET | `/health` | Health check |

## 🏗️ Architecture & Design Decisions

### Frontend Architecture
- **Component-based structure**: Modular React components for maintainability
- **State management**: Local React state with hooks for simplicity
- **API layer**: Centralized Axios configuration for consistent HTTP requests
- **Responsive design**: Mobile-first approach with CSS Grid and Flexbox

### Backend Architecture  
- **RESTful API**: Clear and predictable endpoint structure
- **Middleware pattern**: CORS, JSON parsing, and error handling
- **Service layer**: Separated business logic from route handlers
- **Database abstraction**: Supabase client for type-safe database operations

### Key Design Decisions

1. **Supabase over custom PostgreSQL**: Faster development with built-in auth, real-time, and APIs
2. **OpenAI GPT-3.5-turbo**: Cost-effective AI model with good performance for text summarization
3. **Slack Webhooks**: Simple integration without complex OAuth flows
4. **Monorepo structure**: Easier development and deployment management
5. **Environment-based configuration**: Secure credential management

## 🔒 Security Considerations

- Environment variables for sensitive data
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Rate limiting considerations for production
- Secure API key management

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. Create a new project on Railway or Heroku
2. Connect your GitHub repository
3. Set environment variables in the platform dashboard
4. Deploy from main branch

### Frontend Deployment (Vercel/Netlify)

1. Connect your repository to Vercel or Netlify  
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables
5. Deploy

### Environment Variables for Production

Make sure to update these for production:

```env
# Backend
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
OPENAI_API_KEY=your_openai_api_key
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Frontend  
REACT_APP_API_URL=https://your-api-domain.com
```

## 🧪 Testing

Run frontend tests:

```bash
cd frontend
npm test
```

Run backend tests:

```bash
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Backend server won't start:**
- Check if all environment variables are set correctly
- Ensure Supabase credentials are valid
- Verify OpenAI API key has sufficient credits

**Frontend can't connect to backend:**
- Confirm backend is running on correct port
- Check REACT_APP_API_URL in frontend .env
- Verify CORS configuration in backend

**Slack messages not sending:**
- Validate Slack webhook URL
- Check webhook permissions in Slack app settings
- Ensure the webhook is active

**Database connection errors:**
- Verify Supabase URL and key
- Check if todos table exists
- Confirm database permissions

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues  
3. Create a new issue with detailed information
4. Join our community discussions

## 🎯 Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Todo categories and tags
- [ ] Due dates and reminders
- [ ] Advanced AI prompts customization
- [ ] Multiple Slack channel support
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Recurring todos
- [ ] Analytics and insights
- [ ] Team collaboration features

---

Built with ❤️ for productivity enthusiasts