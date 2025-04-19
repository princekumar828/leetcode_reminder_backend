# Deploying to Railway

This guide will help you deploy the POTD Reminder application to Railway and fix common issues.

## Initial Deployment

1. **Create a Railway account** at https://railway.app/

2. **Create a new project** and connect your GitHub repository

3. **Set up environment variables** in the Railway dashboard:
   - `_PORT`: 8000 (or let Railway assign a port)
   - `_MONGODB_URI`: Your MongoDB Atlas connection string
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `NODE_ENV`: production

4. **Deploy** using the Railway dashboard

## Fixing MongoDB Connection Issues

If you encounter the error:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```

Follow these steps:

### 1. Whitelist IP Addresses in MongoDB Atlas

1. **Log in to MongoDB Atlas** at https://cloud.mongodb.com/

2. **Select your cluster** from the dashboard

3. **Go to Network Access** in the left sidebar

4. **Add IP addresses**:
   - Click "Add IP Address"
   - For development, you can add `0.0.0.0/0` to allow access from anywhere
   - For production, consider adding specific IP ranges if possible
   - Click "Confirm"

5. **Save your changes**

### 2. Check Your Connection String

1. **Verify your MongoDB connection string** in Railway's environment variables
2. **Make sure it's correctly formatted**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
3. **Ensure there are no extra spaces or characters**

### 3. Update Environment Variables

1. **Go to your Railway project dashboard**
2. **Navigate to the Variables tab**
3. **Update your `_MONGODB_URI` variable** if needed
4. **Redeploy your application** after making changes

### 4. Check MongoDB Atlas Status

1. **Verify that your MongoDB Atlas cluster is running**
2. **Check if there are any maintenance windows or issues** reported by MongoDB

## Troubleshooting

If you're still experiencing issues:

1. **Check Railway logs** for more detailed error messages
2. **Verify that your MongoDB Atlas user has the correct permissions**
3. **Try creating a new MongoDB Atlas user** with appropriate permissions
4. **Consider using a different MongoDB provider** like Railway's built-in MongoDB service

## Using Railway's MongoDB Service

As an alternative to MongoDB Atlas:

1. **Add a MongoDB service** to your Railway project
2. **Railway will automatically set up the connection string** in your environment variables
3. **Update your application to use the new connection string** if needed

## Monitoring Your Deployment

1. **Set up monitoring** for your application using Railway's built-in tools
2. **Check the logs** regularly to ensure everything is working correctly
3. **Set up alerts** for any issues that might arise 