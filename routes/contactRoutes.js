const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const axios = require('axios');


//setting up the database connection
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process. env.MYSQL_DATABASE
});

db.connect((err)=>{
    if(err) throw err;
    console.log('Connected to MySQL in routes.');
})

// EndPoint POST /createContact
router.post('/createContact', (req, res) => {
    const{ first_name, last_name, email, mobile_number, data_store} = req.body;

    if(data_store === 'CRM'){
        const apiKey = process.env.FRESHSALES_API_KEY;
        axios.post('https://personal-751653144681306081.myfreshworks.com/crm/sales/contacts', {
            first_name,
            last_name,
            email,
            mobile_number
        }, {
            headers: {Authorization: `Token token=${apiKey}`}
        }).then(response=> res.json(response.data))
        .catch(error => res.status(500).send(error));
    }else if (data_store === 'DATABASE'){
        db.query('INSERT INTO contacts SET ?', { first_name, last_name, email, mobile_number }, 
            (err, result) => {
                if (err) throw err;
                res.send('Contact added with ID: ' + result.insertId);
            });
    }else{
        res.status(400).send({error: 'Invalid data_store value. Use "CRM" or "DATABASE"'});
    }
});

module.exports = router;