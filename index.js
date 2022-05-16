require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');

var usersRouter = require('./src/routes/users.routes');

const port = process.env.PORT || 3000;
const app = express()

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

    app.use('/users', usersRouter);
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      res.status(err.status || 404).json({
        message: "No such route exists"
      })
    });

    // error handler
    app.use(function(err, req, res, next) {
      res.status(err.status || 500).json({
        message: "Error Message"
      })
    });
    
});