# SMPC EigenLayer Backend

## Project Overview
A robust backend service for the SMPC EigenLayer project, providing comprehensive API endpoints for user management, project tracking, task management, and real-time notifications.

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Winston Logging

## Prerequisites
- Node.js (v16+ recommended)
- MongoDB (v5+)
- npm or Yarn

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/smpc-eigenlayer-backend.git
cd smpc-eigenlayer-backend/backend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file with the following configurations:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/smpc-eigenlayer
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

### Production Mode
```bash
npm start
# or
yarn start
```

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/ethereum-login`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/read`
- `DELETE /api/notifications`

## Testing
```bash
npm test
# or
yarn test
```

## Security Features
- JWT Authentication
- Password Hashing
- Input Validation
- Rate Limiting
- CORS Protection
- Helmet Security Middleware

## Logging
Logs are stored in `logs/` directory with different log levels.

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Contact
[Your Contact Information] 