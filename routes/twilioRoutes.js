const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const client = new twilio(process.env.TwILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// EndPoint: Post /makeCall
router.post('/makeCall', (req, res) => {
    const { to } = req.body;
    client.calls.create({
        url: 'http://your-webhook-url.com/ivr',
        to: to,
        from: process.env.TWILIO_PHONE_NUMBER
    }).then(call=> res.status(200).send(call))
    .catch(error => res.status(500).send(error));
});

module.exports = router;