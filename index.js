require('dotenv').config()
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const mongoSanitize = require('express-mongo-sanitize');
const { connectDB } = require('./src/database');

const port = process.env.PORT || 3000;
const app = express()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IS2 Shop Online',
      version: '1.0.0',
    },
    servers: [{
      url: "http://localhost:3000/api/",
      description: "Development server"
    },
    {
      url: "https://is2shoponline.herokuapp.com/api/",
      description: "Production server"
    }],
    components: {
      securitySchemes: {
        token: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "token",
          in: "header"
        }
      }
    }
  },
  apis: [
    './src/routes/users.routes.js',
    './src/routes/products.routes.js',
    './src/routes/cart.routes.js',
    './src/routes/orders.routes.js',
  ], // files containing annotations as above
};
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(mongoSanitize());
app.use(cors());

// router
const usersRouter = require('./src/routes/users.routes');
const productsRouter = require('./src/routes/products.routes');
const cartRouter = require('./src/routes/cart.routes.js');
const ordersRouter = require('./src/routes/orders.routes');

// files
app.use('/', express.static('public'));

// api
app.use('/api/v2/users', usersRouter);
app.use('/api/v2/products', productsRouter);
app.use('/api/v2/cart', cartRouter);
app.use('/api/v2/orders', ordersRouter.router);
app.use('/api/v1/orders', ordersRouter.router_v1);


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

if (process.env.NODE_ENV !== 'test') {
  try {
    connectDB()
  } catch (error) {
    console.log("database error")
  }
}

var server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = { app, server };