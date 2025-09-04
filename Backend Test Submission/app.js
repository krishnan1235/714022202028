const express = require('express');
const bodyParser = require('body-parser');
const { log, makeLogger } = require('../LoggingMiddleware/logger');


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(makeLogger);

const urlDatabase = {};

log('backend', 'info', 'db', 'Using in-memory database for URL storage');

function makeCode() {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}


app.post('/shorturls', (req, res) => {
    try {
        const longUrl = req.body.url;
        const validTime = req.body.validity || 30;
        const userCode = req.body.shortcode;

       
        if (!longUrl) {
            log('backend', 'error', 'handler', 'No URL provided');
            return res.status(400).json({ error: 'Please provide a URL' });
        }

       
        try {
            new URL(longUrl);
        } catch (error) {
            log('backend', 'error', 'handler', 'Bad URL format');
            return res.status(400).json({ error: 'URL format is not valid' });
        }

       
        const shortCode = userCode || makeCode();

       
        if (urlDatabase[shortCode]) {
            log('backend', 'error', 'handler', 'Shortcode already taken');
            return res.status(409).json({ error: 'This shortcode is already used' });
        }

       
        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + validTime);

   
        urlDatabase[shortCode] = {
            longUrl: longUrl,
            shortCode: shortCode,
            clicks: 0,
            visitors: [],
            madeOn: new Date(),
            expiresOn: expireTime
        };
        log('backend', 'info', 'db', 'Saved new short URL');

        res.status(201).json({
            shortLink: `http://localhost:${port}/${shortCode}`,
            expiry: expireTime.toISOString()
        });

    } catch (error) {
        log('backend', 'error', 'handler', 'Error making short URL: ' + error.message);
        res.status(500).json({ error: 'Could not make short URL' });
    }
});

app.get('/shorturls/:shortcode', (req, res) => {
    try {
        const url = urlDatabase[req.params.shortcode];

        if (!url) {
            log('backend', 'warn', 'handler', 'URL not found');
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json({
            clicks: url.clicks,
            longUrl: url.longUrl,
            madeOn: url.madeOn,
            expiresOn: url.expiresOn,
            visitors: url.visitors
        });

    } catch (error) {
        log('backend', 'error', 'handler', 'Error getting URL info: ' + error.message);
        res.status(500).json({ error: 'Could not get URL info' });
    }
});


app.get('/:shortcode', (req, res) => {
    try {
        const url = urlDatabase[req.params.shortcode];

        if (!url) {
            log('backend', 'warn', 'handler', 'URL not found for redirect');
            return res.status(404).json({ error: 'URL not found' });
        }

        if (url.expiresOn < new Date()) {
            log('backend', 'warn', 'handler', 'URL has expired');
            return res.status(410).json({ error: 'URL has expired' });
        }

        
        url.clicks += 1;
        url.visitors.push({
            time: new Date(),
            from: req.headers.referer || 'direct',
            place: req.ip
        });
        log('backend', 'info', 'handler', 'Redirecting to long URL');

        res.redirect(url.longUrl);

    } catch (error) {
        log('backend', 'error', 'handler', 'Error redirecting: ' + error.message);
        res.status(500).json({ error: 'Could not redirect to URL' });
    }
});


app.listen(port, () => {
    log('backend', 'info', 'handler', `Server started on port ${port}`);
});
