URL Shortener App – Simple Design Document
What It Does

I built a small app that takes long web addresses and turns them into short, easy-to-share links.

Users can either let the app create a random short code or choose their own.

Each short link works for 30 minutes by default, but the time can be changed.

The app also counts how many times people click on each short link.

Why I Built It This Way

Express.js: I chose Express.js because it’s quick and simple for building APIs.

Memory storage: Instead of using a database, I stored the data in memory. This made the app faster and easier to test. In a real project, I’d use a proper database.

Logging: I added a logging system that sends messages to an external server so I can track what’s happening.

How It Works

A user sends a long URL to the app.

The app checks if it’s valid.

It either uses the short code the user provided or generates a random one (6 characters of letters and numbers).

The app stores the mapping of short code → long URL, along with the time it was created, its expiry time, and a click counter.

When someone visits the short link, the app:

Checks if it has expired.

If valid, increases the click count and redirects to the original URL.

If expired, shows an error message.

What Data Is Stored

For each short link, the app keeps:

The original long URL

The short code

When it was created and when it will expire

How many times it’s been clicked

Visitor details (time and IP)

Error Handling

The app returns clear error messages:

Invalid URL → 400

Short code not found → 404

Short code already taken → 409

Expired link → 410

Server issues → 500

What I Learned

This project showed me that keeping things simple is often the best approach. Using in-memory storage and clean error handling made development smooth and easy.
