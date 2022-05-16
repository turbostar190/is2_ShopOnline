require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');

const port = process.env.PORT || 3000;

const app = express()

// TODO: refactor routing
app.get('/api/', (req, res) => {
  res.send('Hello World!')
})

app.use('/', express.static('public'));

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

/**
 * Configure mongoose
 */
// mongoose.Promise = global.Promise;
app.locals.db = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});