# URL Shortener Microservice - Design Document

## Executive Summary

This document outlines the architectural and design decisions for a production-grade URL Shortener Microservice built to meet specific evaluation requirements while maintaining scalability, reliability, and maintainability.

## System Requirements Analysis

### Functional Requirements
- Create shortened URLs with unique codes
- Support custom shortcodes
- Default 30-minute expiration with configurable validity
- Redirect functionality with analytics tracking
- Comprehensive logging integration
- RESTful API design

### Non-Functional Requirements
- High availability and reliability
- Scalable architecture
- Production-grade code quality
- Comprehensive error handling
- Observable through structured logging

## Architectural Decisions

### 1. Technology Stack Selection

**Backend Framework: Express.js 5.1.0**
- **Rationale**: Mature, lightweight, and widely adopted
- **Benefits**: Fast development, extensive middleware ecosystem, excellent performance
- **Trade-offs**: Single-threaded nature requires careful async handling

**Database: MongoDB with Mongoose ODM**
- **Rationale**: Document-based storage suits URL metadata and analytics
- **Benefits**: Flexible schema, excellent performance for read-heavy workloads, built-in indexing
- **Trade-offs**: Eventual consistency model, requires careful query optimization

**HTTP Client: node-fetch 2.7.0**
- **Rationale**: Standard fetch API compatibility for external service calls
- **Benefits**: Promise-based, lightweight, familiar API
- **Trade-offs**: Additional dependency for Node.js versions < 18

### 2. Database Schema Design

```javascript
{
  longUrl: String (required, indexed),
  shortCode: String (required, unique, indexed),
  clicks: Number (default: 0),
  visitors: [{
    time: Date,
    from: String,
    place: String
  }],
  madeOn: Date (default: now),
  expiresOn: Date (required, indexed)
}
```

**Design Rationale:**
- **Embedded visitors array**: Optimizes for read performance over write normalization
- **Multiple indexes**: shortCode (primary lookup), expiresOn (cleanup), longUrl (duplicate detection)
- **Denormalized structure**: Reduces join operations, improves query performance

### 3. Short Code Generation Strategy

**Algorithm: Base62 Encoding (6 characters)**
- **Character set**: a-z, A-Z, 0-9 (62 characters)
- **Combinations**: 62^6 = 56,800,235,584 possible codes
- **Collision handling**: Database unique constraint with retry mechanism

**Design Rationale:**
- **URL-safe characters**: No special encoding required
- **Sufficient entropy**: Extremely low collision probability
- **Fixed length**: Consistent URL structure and predictable storage

### 4. Expiration System Design

**Time-based expiration with configurable validity**
- **Default**: 30 minutes from creation
- **Storage**: Absolute timestamp in UTC
- **Cleanup**: Application-level expiration checking
- **Indexing**: expiresOn field indexed for efficient queries

**Design Rationale:**
- **Absolute timestamps**: Eliminates timezone confusion
- **Application-level checking**: Provides immediate feedback without background jobs
- **Configurable validity**: Supports different use cases while maintaining defaults

### 5. Logging Architecture

**Structured logging with external service integration**
- **Levels**: debug, info, warn, error, fatal
- **Categories**: stack, level, package, message
- **Transport**: HTTP POST to evaluation service
- **Authentication**: Bearer token authentication

**Design Rationale:**
- **Structured format**: Enables automated log analysis
- **External service**: Centralized logging for evaluation and monitoring
- **Categorization**: Facilitates filtering and debugging
- **Async logging**: Non-blocking application performance

### 6. API Design Principles

**RESTful design with clear resource modeling**
- **Resource**: URLs represented as `/shorturls`
- **Operations**: POST (create), GET (read), GET (redirect)
- **Status codes**: Appropriate HTTP semantics
- **Content negotiation**: JSON for API, redirects for browser

**Design Rationale:**
- **REST compliance**: Industry standard, predictable behavior
- **Resource-oriented**: Clear mental model for API consumers
- **HTTP semantics**: Leverages existing infrastructure and tooling

## Implementation Decisions

### 1. Error Handling Strategy

**Comprehensive error handling with appropriate HTTP status codes**
- **400 Bad Request**: Invalid input, malformed URLs
- **404 Not Found**: Non-existent shortcodes
- **409 Conflict**: Shortcode collisions
- **410 Gone**: Expired URLs
- **500 Internal Server Error**: System failures

**Design Rationale:**
- **HTTP semantics**: Clear communication of error types
- **Client guidance**: Enables appropriate client-side handling
- **Debugging support**: Detailed error messages for development

### 2. Validation Strategy

**Multi-layer validation approach**
- **Input validation**: URL format, shortcode format, validity ranges
- **Business logic validation**: Expiration checking, uniqueness constraints
- **Database constraints**: Schema enforcement, unique indexes

**Design Rationale:**
- **Defense in depth**: Multiple validation layers prevent data corruption
- **Early failure**: Input validation provides immediate feedback
- **Data integrity**: Database constraints ensure consistency

### 3. Analytics Implementation

**Embedded analytics with visitor tracking**
- **Click counting**: Simple increment on each access
- **Visitor tracking**: Timestamp, referrer, IP address
- **Storage strategy**: Embedded array for performance

**Design Rationale:**
- **Real-time analytics**: Immediate availability without batch processing
- **Embedded storage**: Optimizes for read performance
- **Privacy consideration**: Coarse-grained location data only

## Performance Considerations

### 1. Database Optimization

**Indexing strategy**
- **Primary index**: shortCode (unique, most frequent lookup)
- **Expiration index**: expiresOn (cleanup queries)
- **Analytics index**: Compound index on shortCode + visitors.time

**Query optimization**
- **Single document operations**: Minimize database round trips
- **Projection**: Return only required fields for statistics
- **Connection pooling**: Reuse database connections

### 2. Application Performance

**Asynchronous operations**
- **Non-blocking I/O**: All database and HTTP operations async
- **Error handling**: Proper async error propagation
- **Logging**: Non-blocking external service calls

**Memory management**
- **Stateless design**: No server-side session storage
- **Efficient data structures**: Minimal object creation in hot paths
- **Connection reuse**: HTTP keep-alive for external services

## Security Considerations

### 1. Input Security

**Validation and sanitization**
- **URL validation**: Proper URL format checking
- **Shortcode validation**: Alphanumeric character restriction
- **Length limits**: Prevent resource exhaustion attacks

### 2. Operational Security

**Authentication and authorization**
- **API authentication**: Bearer token for logging service
- **Environment variables**: Secure credential storage
- **Error disclosure**: Minimal information leakage in error messages

## Scalability Design

### 1. Horizontal Scaling

**Stateless architecture**
- **No server-side sessions**: Each request independent
- **Database-backed state**: All state in MongoDB
- **Load balancer ready**: No sticky session requirements

### 2. Database Scaling

**MongoDB scaling strategies**
- **Read replicas**: Scale read operations
- **Sharding ready**: shortCode-based sharding possible
- **Index optimization**: Efficient query performance

## Monitoring and Observability

### 1. Logging Strategy

**Comprehensive application logging**
- **Request lifecycle**: Entry and exit logging
- **Error tracking**: Detailed error context
- **Performance metrics**: Response time tracking
- **Business metrics**: URL creation and access patterns

### 2. Health Monitoring

**Application health indicators**
- **Database connectivity**: Connection status monitoring
- **External service health**: Logging service availability
- **Resource utilization**: Memory and CPU tracking ready

## Deployment Considerations

### 1. Environment Configuration

**Configuration management**
- **Environment variables**: Runtime configuration
- **Default values**: Sensible defaults for development
- **Validation**: Configuration validation on startup

### 2. Dependencies

**External service dependencies**
- **MongoDB**: Primary data store
- **Logging service**: External evaluation service
- **Network connectivity**: Internet access for external calls

## Testing Strategy

### 1. API Testing

**Comprehensive endpoint testing**
- **Happy path**: Normal operation scenarios
- **Error scenarios**: Invalid input, expired URLs, conflicts
- **Performance testing**: Response time measurement
- **Integration testing**: End-to-end workflow validation

### 2. Quality Assurance

**Code quality measures**
- **Error handling**: Comprehensive error scenarios
- **Input validation**: Edge case testing
- **Performance**: Response time requirements
- **Reliability**: Failure recovery testing

## Future Enhancements

### 1. Feature Extensions

**Potential improvements**
- **Custom domains**: Support for branded short URLs
- **Analytics dashboard**: Web interface for statistics
- **Bulk operations**: Batch URL creation
- **API rate limiting**: Request throttling

### 2. Technical Improvements

**Architecture evolution**
- **Caching layer**: Redis for frequently accessed URLs
- **Message queues**: Async analytics processing
- **Microservice decomposition**: Separate analytics service
- **Container deployment**: Docker and Kubernetes support

## Conclusion

This URL Shortener Microservice implements a robust, scalable, and maintainable solution that meets all specified requirements while following industry best practices. The design prioritizes reliability, performance, and observability, making it suitable for production deployment and future enhancement.
