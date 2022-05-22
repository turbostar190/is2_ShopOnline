require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const port = process.env.PORT || 3000;
const app = express()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IS2 Shop Online',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'], // files containing annotations as above
};
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
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

    // router
    const usersRouter = require('./src/routes/users.routes');
    const productsRouter = require('./src/routes/products.routes');
    const ordersRouter = require('./src/routes/orders.routes');
    const cartRouter = require('./src/routes/cart.routers.js');
    
    // files
    app.use('/', express.static('public'));

    // api
    app.use('/api/v1/users', usersRouter);
    app.use('/api/v1/products', productsRouter);
    app.use('/api/v1/orders', ordersRouter);
    app.use('/api/v1/cart', cartRouter);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      res.status(404).json({
        message: "No such route exists"
      })
    });

    // catch 500 and forward to error handler
    app.use(function (err, req, res, next) {
      res.status(500).json({
        message: err
      })
    });
  });
