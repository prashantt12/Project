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

/// EndPoint: POST /getContact
router.post('/getContact', (req, res) => {
    const { contact_id, data_store } = req.body;

    if (data_store === 'CRM') {
        const apiKey = process.env.FRESHSALES_API_KEY;
        axios.get(`https://personal-751653144681306081.myfreshworks.com/crm/sales/contacts/${contact_id}`, {
            headers: { Authorization: `Token token=${apiKey}` }
        })
        .then(response => res.json(response.data))
        .catch(error => res.status(500).send(error));
    } else if (data_store === 'DATABASE') {
        db.query('SELECT * FROM contacts WHERE id = ?', [contact_id], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res.status(404).send('Contact not found');
            }
        });
    } else {
        res.status(400).send({ error: 'Invalid data_store value. Use "CRM" or "DATABASE"' });
    }
});

// EndPoint: POST /updateContact
router.post('/updateContact', (req, res) => {
    const { contact_id, new_email, new_mobile_number, data_store } = req.body;

    if (data_store === 'CRM') {
        const apiKey = process.env.FRESHSALES_API_KEY;
        axios.put(`https://personal-751653144681306081.myfreshworks.com/crm/sales/contacts/${contact_id}`, {
            email: new_email,
            mobile_number: new_mobile_number
        }, {
            headers: { Authorization: `Token token=${apiKey}` }
        })
        .then(response => res.json(response.data))
        .catch(error => res.status(500).send(error));
    } else if (data_store === 'DATABASE') {
        db.query('UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?', 
        [new_email, new_mobile_number, contact_id], (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) {
                res.send('Contact updated successfully');
            } else {
                res.status(404).send('Contact not found');
            }
        });
    } else {
        res.status(400).send({ error: 'Invalid data_store value. Use "CRM" or "DATABASE"' });
    }
});

// EndPoint: POST /deleteContact
router.post('/deleteContact', (req, res) => {
    const { contact_id, data_store } = req.body;

    if (data_store === 'CRM') {
        const apiKey = process.env.FRESHSALES_API_KEY;
        axios.delete(`https://personal-751653144681306081.myfreshworks.com/crm/sales/contacts/${contact_id}`, {
            headers: { Authorization: `Token token=${apiKey}` }
        })
        .then(() => res.send('Contact deleted successfully'))
        .catch(error => res.status(500).send(error));
    } else if (data_store === 'DATABASE') {
        db.query('DELETE FROM contacts WHERE id = ?', [contact_id], (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) {
                res.send('Contact deleted successfully');
            } else {
                res.status(404).send('Contact not found');
            }
        });
    } else {
        res.status(400).send({ error: 'Invalid data_store value. Use "CRM" or "DATABASE"' });
    }
});

module.exports = router;