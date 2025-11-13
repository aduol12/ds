# CORS Configuration Required for Frontend

## Problem
The frontend at `https://frontend-production-f59d.up.railway.app` cannot communicate with the backend at `https://ds-back-production.up.railway.app` because CORS is not enabled.

## Solution

### For Node.js/Express Backend

```bash
npm install cors
```

Then add to your app:

```javascript
const cors = require('cors');
const express = require('express');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: [
    'https://frontend-production-f59d.up.railway.app',
    'http://localhost:3000',  // For local development
    'http://localhost:5173'   // For Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rest of your app configuration...
```

### For Django Backend

```bash
pip install django-cors-headers
```

Then update `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    'https://frontend-production-f59d.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5173',
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```

### For FastAPI Backend

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://frontend-production-f59d.up.railway.app',
        'http://localhost:3000',
        'http://localhost:5173',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
```

### For Other Frameworks
Check your framework's documentation for CORS middleware configuration.

## Required Headers

Your API responses must include:
- `Access-Control-Allow-Origin`: The frontend domain
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization
- `Access-Control-Allow-Credentials`: true (if using cookies/auth)

## Testing

After enabling CORS, test with:
```bash
curl -X OPTIONS https://ds-back-production.up.railway.app/auth/login \
  -H "Origin: https://frontend-production-f59d.up.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

You should see CORS headers in the response.

## Frontend Domains to Whitelist

- **Production**: `https://frontend-production-f59d.up.railway.app`
- **Local Development**: `http://localhost:3000` and `http://localhost:5173`