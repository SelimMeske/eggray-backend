const express = require('express');
const router = express.Router();
const db = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtMiddle = require('../middlewares/jwt-verification');

const connection = db.createConnection({
    database: 'eggray',
    user: 'mesic',
    password: 'tibor123',
    host: 'localhost'
});

connection.connect(error => {
    if(error) throw error;
    console.log('Database connected.')
});

router.post('/', jwtMiddle, (req, res, next) => {
    
    let user = {
        name: req.body.name,
        password: req.body.password
    }

    const command = 'INSERT INTO admins SET name = ?, password = ?';

    bcrypt.hash(user.password, 10, (err, hash) => {

        if(err) throw err;


        connection.query(command, [user.name, hash], (err, response) => {

            if (err) throw err;

            res.status(200).json({
                message: 'User is created.'
            })
        });
    });
});

router.post('/login', (req, res, next) => {

    let user = {
        name: req.body.name,
        password: req.body.password
    }

    let command = 'SELECT * FROM admins WHERE name = ?'

    connection.query(command, user.name, (err, response) => {
        
        if (err) throw err;

        if(!response[0]){
            
            return res.status(404).json({
                message: "User not found."
            })
            
        }

        let dbUser = {
            name: response[0].name,
            password: response[0].password
        }
        
        bcrypt.compare(user.password, dbUser.password, (err, response) => {

            if (err) throw err;
 
            if(!response){

                return res.status(404).json({
                    message: 'Username or password is incorect.'
                })
            }

            let webToken = jwt.sign({name: dbUser.name}, 'this_is_very_secret', {expiresIn: '1h'})

            res.status(200).json({
                message: 'Wellcome back, '+ dbUser.name,
                expiresIn: '3600',
                token: webToken,
                userName: dbUser.name
            });

        });
    });

    

    
});

module.exports = router;