# Word App

A web application for creating and managing documents, built with React, Express, and Tailwind CSS.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication with Firebase
- Create, view, and edit documents
- Save documents to Google Drive
- Responsive design using Tailwind CSS

## Technologies

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Firebase
- **APIs**: Google Drive API

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/word-app.git
   cd word-app
   ```

2. Install dependencies for the client:

   ```bash
   cd client
   npm install
   ```

3. Install dependencies for the server:

   ```bash
   cd ../server
   npm install
   ```

4. Set up environment variables. Create a `.env` file in the `server` directory and add your configuration:

   ```plaintext
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   REDIRECT_URI=http://localhost:5001/auth/google/callback
   NODE_ENV=development
   ```

5. Set up environment variables. Create a `.env` file in the `client` directory and add your configuration:
 
   ```plaintext
    REACT_APP_API_URL=http://localhost:5001/api
    REACT_APP_FIREBASE_CONFIG={
      apiKey: "your-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "your-messaging-sender-id",
      appId: "your-app-id"
    }
    ```

## Usage

1. Start the server:

   ```bash
   cd server
   npm start
   ```

2. Start the client:

   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to access the application.

## API Endpoints

- **Authentication**
  - `POST /api/auth/login`: Log in a user.
  - `POST /api/auth/logout`: Log out a user.

- **Documents**
  - `POST /api/documents/save`: Save a document to Google Drive.
  - `GET /api/documents/:documentId`: Retrieve a document by ID.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
