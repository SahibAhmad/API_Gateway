const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = 3005;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5 //five requests per 1minute
})

app.use(morgan('combined'));
app.use(limiter);

// Fix the target URL format and path
app.use('/bookingservice', async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
            headers: {
                'x-access-token': token,

            }
        });
        
        if (response.data.success)
            next();
        else
            return res.status(401).json({
                message: "unauthorised"
            })
    } catch (error) {
        return res.status(401).json({
            message: "unauthorised"
        })
    }
})
app.use('/bookingservice', createProxyMiddleware({
    target: 'http://localhost:3002/bookingservice',
    changeOrigin: true,

}));



app.listen(PORT, async () => {
    console.log("server started at ", PORT);
});
