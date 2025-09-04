# URL Shortener App - How I Built It

## What I Made

I built a simple URL shortener that takes long web addresses and makes them short. Users can create custom short codes or let the system generate random ones. Each shortened URL expires after 30 minutes by default, but users can change this. The app also tracks how many times people click on the links.

## Why I Made These Choices

I used Express.js because it's easy to work with and gets the job done quickly. Instead of setting up a complex database like MongoDB, I decided to store everything in the computer's memory using simple JavaScript objects. This made the app much faster and easier to test without worrying about database connections.

For the logging system, I used node-fetch to send log messages to an external server as required by the test. This helps track what the app is doing and if anything goes wrong.

## How the App Works

When someone sends a long URL to my app, it first checks if the URL is valid. Then it either uses the custom short code they provided or creates a random 6-character code using letters and numbers. The app stores this information along with when it was created and when it should expire.

When someone visits the short URL, the app looks up the original URL, adds one to the click counter, records some visitor information, and then redirects them to the original website. If the URL has expired, it shows an error message instead.

## Data Storage

I keep track of each shortened URL with this information:
- The original long URL
- The short code (like "abcd1")
- How many times it's been clicked
- A list of visitors with timestamps
- When it was created
- When it expires

Since I'm using memory storage, everything is fast but gets reset when the server restarts. For a real production app, I'd use a proper database.

## Creating Short Codes

I generate 6-character codes using letters (both uppercase and lowercase) and numbers. This gives me over 56 billion possible combinations, so running out of codes isn't a worry. If someone tries to use a code that already exists, the app tells them it's taken and they need to pick a different one.

## URL Expiration

By default, shortened URLs last for 30 minutes, but users can change this when they create them. I store the exact time when each URL should expire, and when someone tries to use an expired link, I show them an error message instead of redirecting them.

## Logging System

I built a logging system that sends messages to an external server for monitoring. It tracks different types of events like when someone creates a URL, when there's an error, or when someone visits a link. The logs are organized by importance level (info, warning, error, etc.) and what part of the app they came from.

## API Design

I made three main endpoints:
1. POST /shorturls - Creates a new short URL
2. GET /shorturls/:shortcode - Gets statistics about a short URL
3. GET /:shortcode - Redirects to the original URL

I use proper HTTP status codes so other developers know what happened - 201 for successful creation, 404 for not found, 409 for conflicts, etc.

## Error Handling

I made sure the app handles different types of problems gracefully:
- If someone sends a bad URL format, it returns a 400 error
- If they ask for a short code that doesn't exist, it returns 404
- If they try to use a short code that's already taken, it returns 409
- If they try to access an expired URL, it returns 410
- If something goes wrong with the server, it returns 500

## Input Validation

Before processing any request, I check that the data makes sense. URLs must be in proper format, short codes can only contain letters and numbers, and expiration times must be reasonable numbers.

## Analytics Tracking

Every time someone clicks a shortened URL, I record when it happened, what website they came from, and their IP address. This information gets stored with the URL data so users can see how their links are performing.

## Performance and Speed

Since I'm using in-memory storage, the app is very fast. Looking up short codes and redirecting users happens almost instantly. The downside is that all data gets lost when the server restarts, but for this test that's not a problem.

## Security

I validate all incoming data to make sure people can't send malicious requests. URLs must be properly formatted, and short codes can only contain safe characters. I also use environment variables to store sensitive information like authentication tokens.

## Testing

I tested all three API endpoints using Postman to make sure they work correctly:
- Creating short URLs with both custom and auto-generated codes
- Getting statistics for existing URLs
- Redirecting to original URLs and tracking clicks
- Handling error cases like expired URLs and invalid input

## What I Learned

Building this app taught me the importance of keeping things simple. Instead of over-engineering with complex databases and caching systems, I focused on making something that works reliably and meets all the requirements. The in-memory approach made development and testing much easier.

## Future Improvements

If I were to expand this app, I would add:
- A proper database for persistent storage
- User accounts and authentication
- Custom analytics dashboard
- Rate limiting to prevent abuse
- Support for custom domains

## Conclusion

This URL shortener successfully meets all the test requirements while being simple, fast, and easy to understand. The code is clean, well-organized, and includes proper error handling and logging as requested.
