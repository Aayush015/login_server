const express = require('express');
const router = express.Router();

// MongoDB model
const User = require('./../models/User');

// Password hashing using bcrypt
const bcrypt = require('bcrypt');

// Signup route
router.post('/signup', (req, res) => {
    let {name, email, password, dateOfBirth} = req.body;
    // Trim the white spaces
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    // Check if any of the fields are empty
    if (name == "" || email == "" || password == "" || dateOfBirth == "") {
        res.json({
            status: 'FAILED',
            message: 'Empty input fields'
        });
    } else if (!/^[a-zA-Z ]+$/.test(name)) {
        res.json({
            status: 'FAILED',
            message: 'Invalid name'
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: 'FAILED',
            message: 'Invalid email'
        });
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: 'FAILED',
            message: 'Invalid date of birth'
        });
    } else if (password.length < 8) {
        res.json({
            status: 'FAILED',
            message: 'Password is too short'
        });
    } else {
        // Check if the user already exists
        User.find({email}).then(result => {
            if (result.length) {
                res.json({
                    status: 'FAILED',
                    message: 'User with this email already exists'
                });
            } else {
                // Create a new user

                // Hash the password
                const saltRounds = 10; 
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: 'SUCCESS',
                            message: 'User created successfully',
                            data: result,
                        });
                    })
                    .catch(err => {
                        res.json({
                            status: 'FAILED',
                            message: 'An error occurred while creating user!'
                        });
                    });

                }).catch(err => {
                    res.json({
                        status: 'FAILED',
                        message: 'An error occurred while hashing password!'
                    })
                });
            }

        }).catch(err => {
            console.log(err);
            res.json({
                status: 'FAILED',
                message: 'An error occurred'
            });
        });
    }

})

// Login route
router.get('/signin', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: 'FAILED',
            message: 'Empty input fields'
        });
    } else {
        // Check if the user exists
        User.find({email})
        .then(data => {
            if (data.length) {
                // User exists
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        // Passwords match
                        res.json({
                            status: 'SUCCESS',
                            message: 'Login successful',
                            data: data
                        });
                    } else {
                        res.json({
                            status: 'FAILED',
                            message: 'Invalid password entered!'
                        });
                    }
                }).catch(err => {
                    res.json({
                        status: 'FAILED',
                        message: 'An error occurred while comparing passwords'
                    });
                });
            } else {
                res.json({
                    status: 'FAILED',
                    message: 'User not found. Please signup!'
                });
            }
        })
        .catch(err => {
            res.json({
                status: 'FAILED',
                message: 'An error occurred while checking for existing user. Please try again'
            });
        });
    }
})

module.exports = router;