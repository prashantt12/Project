const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, MY_PHONE_NUMBER } = process.env;
const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Fetch ngrok URL
async function getNgrokUrl() {
    try {
        const response = await fetch('http://127.0.0.1:4040/api/tunnels');
        const json = await response.json();

        // Extract the ngrok URL from JSON response
        return json.tunnels[0].public_url;
    } catch (error) {
        console.error('Error getting ngrok URL:', error);
        throw error;
    }
}

async function makeCall(to) {
    try {
        const ngrokUrl = await getNgrokUrl();
        const callUrl = `${ngrokUrl}/twilio/ivr`;

        const call = await client.calls.create({
            url: callUrl,
            to: to,
            from: TWILIO_PHONE_NUMBER
        });
        
        console.log('Call initiated', call);
        return call;
    } catch (error) {
        console.error('Failed to make call', error);
        throw error; 
    }
}

// Endpoint to make a call
router.post('/makeCall', (req, res) => {
    const { to } = req.body;
    
    makeCall(to).then(() => res.status(200).json({ message: 'Call initiated' }))
                 .catch(error => res.status(500).json({ message: 'Failed to make call', error }));
});

// Endpoint to handle IVR and play the audio file
router.post('/ivr', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.play('https://onedrive.live.com/download?cid=6D834994D9580DCB&resid=6D834994D9580DCB%21245717&authkey=%21AEm9E0JuXEPP2EE');

    const gather = twiml.gather({
        numDigits: 1,
        action: '/twilio/handleInput', 
        method: 'POST', 
        timeout: 10,  
        input: 'dtmf'
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

// Endpoint to handle key press
router.post('/handleInput', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    console.log(req.body);
    
    const digits = req.body.Digits;
    console.log(digits);

    if (digits === '1') {
        twiml.say('Thank you. Here is your personalized interview link.');
        twiml.sms('Here is your interview link: https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test', {
            to: process.env.MY_PHONE_NUMBER,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
    } else {
        twiml.say('Invalid input. Please try again.');
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;
