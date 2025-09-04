# URL Shortener Microservice

## Architecture Overview

This is a robust HTTP URL Shortener Microservice built with Node.js, Express, and in-memory storage that provides core URL shortening functionality along with analytics capabilities.

## System Architecture

### Core Components

1. **Express Server** - Main HTTP server handling API requests
2. **In-Memory Database** - Fast in-memory storage for URL mappings and analytics
3. **Logging Middleware** - Custom logging system that sends structured logs to external evaluation service
4. **URL Shortening Engine** - Generates unique 6-character codes for URLs

### Technology Stack

- **Backend Framework**: Express.js 5.1.0
- **Database**: In-memory JavaScript object storage
- **HTTP Client**: node-fetch 2.7.0 for external API calls
- **Body Parsing**: body-parser 2.2.0

### Database Schema

```javascript
{
  longUrl: String (required),
  shortCode: String (required, unique),
  clicks: Number (default: 0),
  visitors: [{
    time: Date,
    from: String,
    place: String
  }],
  madeOn: Date (default: now),
  expiresOn: Date (required)
}
```

## API Endpoints

### 1. Create Short URL
- **Method**: POST
- **Endpoint**: `/shorturls`
- **Purpose**: Creates a new shortened URL
- **Request Body**:
  ```json
  {
    "url": "http://chart.apis.google.com/chart?chs=500x500&chma=0,0,100,100&cht=p&chco=FF0000%2CFFFF00%7CFF8000%2C00FF00%7C00FF00%2C0000FF&chd=t%3A122%2C42%2C17%2C10%2C8%2C7%2C7%2C7%2C7%2C6%2C6%2C6%2C6%2C5%2C5&chl=122%7C42%7C17%7C10%7C8%7C7%7C7%7C7%7C7%7C6%7C6%7C6%7C6%7C5%7C5&chdl=android%7Cjava%7Cstack-trace%7Cbroadcastreceiver%7Candroid-ndk%7Cuser-agent%7Candroid-webview%7Cwebview%7Cbackground%7Cmultithreading%7Candroid-source%7Csms%7Cadb%7Csollections%7Cactivity|Chart",
    "validity": 30,
    "shortcode": "abcd1"
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "shortLink": "http://localhost:3000/abcd1",
    "expiry": "2025-09-04T09:39:23.253Z"
  }
  ```

### 2. Get URL Statistics
- **Method**: GET
- **Endpoint**: `/shorturls/:shortcode`
- **Purpose**: Retrieves analytics for a specific short URL
- **Response**: 200 OK
  ```json
  {
    "clicks": 5,
    "longUrl": "https://example.com/very-long-url",
    "madeOn": "2025-01-30T10:00:00.000Z",
    "expiresOn": "2025-01-30T10:30:00.000Z",
    "visitors": [...]
  }
  ```

### 3. Redirect to Original URL
- **Method**: GET
- **Endpoint**: `/:shortcode`
- **Purpose**: Redirects to original URL and tracks analytics
- **Response**: 302 Redirect

## Key Features

### URL Shortening
- Generates unique 6-character alphanumeric codes
- Supports custom shortcodes
- Validates URL format before processing
- Prevents shortcode collisions

### Expiration System
- Default validity: 30 minutes
- Configurable expiration time
- Automatic cleanup of expired URLs
- Proper error handling for expired links

### Analytics & Tracking
- Click counting
- Visitor tracking with timestamps
- Referrer information capture
- IP address logging for geographical insights

### Error Handling
- Comprehensive input validation
- Appropriate HTTP status codes
- Descriptive error messages
- Graceful failure handling

### Logging System
- Structured logging with multiple levels (debug, info, warn, error, fatal)
- Integration with external evaluation service
- Request/response lifecycle tracking
- Categorized logging by component (route, handler, db, etc.)

## Design Decisions

### 1. Microservice Architecture
- Single responsibility principle
- Stateless design for scalability
- RESTful API design

### 2. Database Choice
- In-memory JavaScript object storage for fast access
- Simple key-value structure for URL mappings
- Embedded visitor array for efficient analytics queries

### 3. Short Code Generation
- 6-character alphanumeric codes provide 56+ billion combinations
- Base62 encoding for URL-safe characters
- Collision detection and retry mechanism

### 4. Logging Strategy
- Centralized logging for observability
- External service integration for evaluation
- Structured data format for analysis

### 5. Security Considerations
- Input validation and sanitization
- URL format verification
- Rate limiting ready architecture

## Environment Setup

### Required Environment Variables
- `AUTH_TOKEN`: Bearer token for logging service authentication

### Dependencies
- Node.js environment
- Internet connectivity for external logging service
- No external database required (uses in-memory storage)

## Production Considerations

### Scalability
- Stateless design allows horizontal scaling
- Database indexing on shortCode for fast lookups
- Connection pooling for database efficiency

### Monitoring
- Comprehensive logging for debugging
- Analytics data for usage insights
- Error tracking and alerting ready

### Performance
- Efficient database queries
- Minimal external dependencies
- Asynchronous operations throughout

## Code Quality

### Best Practices Implemented
- Clear naming conventions
- Modular code organization
- Comprehensive error handling
- Input validation
- Separation of concerns
- Production-grade logging

### Testing Strategy
- API endpoint testing with Postman/Insomnia
- Error scenario validation
- Performance testing under load
- Integration testing with external services
