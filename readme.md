# NewsMap

NewsMap is a regional-based news aggregator that lets users explore and filter news on an interactive, interactive map interface.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Contact](#contact)

## Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/newsmap.git

# Navigate into the project folder
cd newsmap

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Usage

```bash
# Start the backend server
cd backend
npm start

# In a separate terminal, build and serve the frontend
cd ../frontend
npm run build

# The build process will generate a working 'dist' folder ready for deployment
```

## Features

- Interactive map to browse regional news
- Saved articles in Favorites for later
- Email notifications powered by SendGrid
- Responsive design for desktop
- User personalization

## Configuration

The project requires two environment files, one for the backend and one for the frontend.

### Backend (`backend/.env`)

```dotenv
NEWS_API_KEY=your_news_api_key  # API key for NewsAPI
MONGO_URI=your_mongodb_connection_string  # MongoDB connection string
NODE_ENV=  # Set the environment mode
CLIENT_URL=  # URL of the client app
SENDGRID_API_KEY=your_sendgrid_api_key  # API key for SendGrid email service
EMAIL_FROM=  # Default from address for emails
FRONTEND_URL=  # URL where the frontend is hosted
PORT=  # Port for the backend server
```

### Frontend (`frontend/.env`)

```dotenv
VITE_API_URL=  # Base URL for API requests
```

## Contributing

Contributions are welcome! Please fork the repository and submit PRs.

Project Link: [http://newsmaps.today]

