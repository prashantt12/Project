const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MiddleWare
app.use(bodyParser.json());

// Basic Route
app.get('/', (req, res)=>{
    req.send('Hello World');
});

//Importing the routes
const contactRoutes = require('./routes/contactRoutes');
const twilioRoutes = require('./routes/twilioRoutes');

//Using routes
app.use('/contacts', contactRoutes);
app.use('/twilio', twilioRoutes);

//Starting the server
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});