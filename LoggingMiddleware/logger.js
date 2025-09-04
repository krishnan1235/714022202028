const fetch = require('node-fetch');

const allowedValues = {
    stacks: ['backend', 'frontend'],
    levels: ['debug', 'info', 'warn', 'error', 'fatal'],
    packages: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route']
};

async function log(stack, level, packageName, message) {
    
    if (!allowedValues.stacks.includes(stack)) {
        console.error('Invalid stack type provided');
        return;
    }

    if (!allowedValues.levels.includes(level)) {
        console.error('Invalid level type provided');
        return;
    }

    if (!allowedValues.packages.includes(packageName)) {
        console.error('Invalid package type provided');
        return;
    }

    
    const logData = {
        stack: stack,
        level: level,
        package: packageName,
        message: message
    };

    try {
       
        const serverResponse = await fetch('http://20.244.56.144/evaluation-service/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.AUTH_TOKEN
            },
            body: JSON.stringify(logData)
        });

        if (!serverResponse.ok) {
            console.error('Failed to send log to server');
        }
    } catch (error) {
        console.error('Log sending error:', error);
    }
}


function makeLogger(req, res, next) {
 
    log('backend', 'info', 'route', `New ${req.method} request to ${req.path}`);

    
    const oldSend = res.send;

    res.send = function(data) {
        
        log('backend', 'info', 'handler', `Sending response with status ${res.statusCode}`);
     
        oldSend.apply(res, arguments);
    };

    next();
}

module.exports = { log, makeLogger };
