# String Analyzer API

RESTful API service that analyzes strings and stores their computed properties.

## Tech Stack
- Node.js + TypeScript
- Express.js
- MongoDB (Mongoose)

## Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account

### Local Installation

1. Clone repository:
```bash
git clone <your-repo-url>
cd string-analyzer-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/string-analyzer
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Base URL
- Local: `http://localhost:3000/api`
- Production: `https://your-app.up.railway.app/api`

### Endpoints

**POST /strings** - Create/analyze string
**GET /strings/:string_value** - Get specific string
**GET /strings** - Get all strings with filters
**GET /strings/filter-by-natural-language** - Natural language filtering
**DELETE /strings/:string_value** - Delete string

## Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (required)

## Example Requests

Create string:
```bash
curl -X POST http://localhost:3000/api/strings \
  -H "Content-Type: application/json" \
  -d '{"value":"hello world"}'
```

Filter palindromes:
```bash
curl "http://localhost:3000/api/strings?is_palindrome=true"
```

Natural language query:
```bash
curl "http://localhost:3000/api/strings/filter-by-natural-language?query=single%20word%20palindromes"
```