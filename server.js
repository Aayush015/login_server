// Mongodb file
require('./config/db');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const UserRouter = require('./api/User');
const ItemRouter = require('./api/Item');

// For accepting post form data
app.use(express.json());

app.use('/user', UserRouter);
app.use('/item', ItemRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});