# POTD Reminder Backend

A backend service for sending LeetCode Problem of the Day (POTD) reminders via Telegram.

## Features

- Fetches LeetCode POTD daily at 00:01 UTC
- Sends reminders to users who haven't solved the POTD
- Tracks user reminder preferences and POTD solving status
- Provides API endpoints for user management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Telegram Bot Token

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   _PORT=8000
   _MONGODB_URI=your_mongodb_connection_string
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

## Development

To run the application in development mode:

```
npm run dev
```

## Deployment

### Option 1: Using the deployment script

1. Make the deployment script executable:
   ```
   chmod +x deploy.sh
   ```
2. Run the deployment script:
   ```
   ./deploy.sh
   ```

### Option 2: Manual deployment

1. Install production dependencies:
   ```
   npm install --production
   ```
2. Set up environment variables (copy from .env.production or create your own)
3. Start the application:
   ```
   npm start
   ```

### Option 3: Deploy to a cloud provider

#### Heroku

1. Create a Heroku app
2. Connect your GitHub repository
3. Set environment variables in the Heroku dashboard
4. Deploy

#### Railway

1. Create a Railway project
2. Connect your GitHub repository
3. Set environment variables in the Railway dashboard
4. Deploy

#### Render

1. Create a Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in the Render dashboard
4. Deploy

## Environment Variables

- `_PORT`: Port number for the server (default: 8000)
- `_MONGODB_URI`: MongoDB connection string
- `TELEGRAM_BOT_TOKEN`: Telegram Bot API token
- `NODE_ENV`: Environment (development/production)

## API Endpoints

- `GET /`: Health check
- `POST /users`: Create a new user
- `GET /users/:id`: Get user by ID
- `PUT /users/:id`: Update user
- `GET /leetcode/potd`: Get today's POTD
- `GET /leetcode/check/:username`: Check if user has solved today's POTD

## License

ISC 