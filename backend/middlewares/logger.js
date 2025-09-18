const logger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    console.log(`📝 ${req.method} ${req.url} - ${req.ip} - ${new Date().toISOString()}`);

    // Log response time
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
        console.log(`${statusEmoji} ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });

    next();
};

module.exports = logger;