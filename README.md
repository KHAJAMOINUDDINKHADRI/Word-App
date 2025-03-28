# Word App - Document Editor with Google Drive Integration

A web application that allows users to create, edit, and save documents directly to Google Drive. Built with React, Node.js, and Firebase.

## Features

- Text editor with formatting capabilities
- Google Sign-in authentication
- Save drafts locally
- Upload documents to Google Drive
- View and retrieve documents from Google Drive
- Google Docs format support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- Firebase project

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:

   - Create `.env` file in the server directory
   - Create `.env` file in the client directory
   - Add necessary environment variables (see .env.example files)

4. Start the development servers:

   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## Environment Variables

### Backend (.env)

```
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Technologies Used

- Frontend:

  - React
  - React Router
  - Firebase Authentication
  - Google Drive API
  - Draft.js (for rich text editing)

- Backend:
  - Node.js
  - Express.js
  - Firebase Admin SDK
  - Google APIs Node.js Client

## Production Deployment

### Prerequisites

- Node.js 14+ and npm
- Google Cloud Platform account
- Firebase project
- Domain name (optional)

### Environment Setup

1. **Client Environment Variables** (.env.production):

```
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_FIREBASE_CONFIG={your-firebase-config}
```

2. **Server Environment Variables** (.env.production):

```
NODE_ENV=production
PORT=8080
CLIENT_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
REDIRECT_URI=https://your-api-domain.com/auth/google/callback
```

### Build and Deploy

1. **Client Build**:

```bash
cd client
npm install
npm run build
```

2. **Server Build**:

```bash
cd server
npm install
npm run build
```

3. **Start Production Server**:

```bash
cd server
NODE_ENV=production npm start
```

### Security Checklist

- [ ] Set up SSL/TLS certificates
- [ ] Configure secure headers (already implemented with helmet)
- [ ] Set up rate limiting (implemented)
- [ ] Enable compression (implemented)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Monitoring

The application includes:

- Health check endpoint at `/health`
- Error logging to `error.log`
- Combined logging to `combined.log`
- Rate limiting (100 requests per 15 minutes per IP)

### Performance Optimizations

1. Client-side:

   - Source maps disabled in production
   - Bundle size analysis available with `npm run analyze`
   - Static asset caching

2. Server-side:
   - Compression enabled
   - Rate limiting implemented
   - Error handling optimized for production

### Maintenance

1. **Logs**:

   - Check `error.log` and `combined.log` regularly
   - Monitor server health endpoint

2. **Updates**:

   - Regularly update npm packages
   - Check for security vulnerabilities with `npm audit`

3. **Backup**:
   - Regular database backups
   - Environment configuration backup

### Troubleshooting

1. **Common Issues**:

   - Check logs in `error.log`
   - Verify environment variables
   - Check Google API quotas
   - Monitor rate limiting

2. **Support**:
   - Create issues in the repository
   - Contact system administrator

## License

[Your License]
