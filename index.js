require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const port = process.env.PORT || 3000;
const app = express()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'], // files containing annotations as above
};
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// TODO: refactor routing
app.get('/api/', (req, res) => {
  res.send('Hello World!')
})

var usersRouter = require('./src/routes/users.routes');
var productsRouter = require('./src/routes/products.routes');

app.use('/', express.static('public'));

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
const cors = require('cors');
app.use(cors())

/**
 * Configure mongoose
 */
// mongoose.Promise = global.Promise;
app.locals.db = mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {

    console.log("Connected to Database");

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    app.use('/users', usersRouter);
    app.use('/products', productsRouter);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      res.status(err.status || 404).json({
        message: "No such route exists"
      })
    });

    // error handler
    app.use(function (err, req, res, next) {
      res.status(err.status || 500).json({
        message: err
      })
    });

  });
