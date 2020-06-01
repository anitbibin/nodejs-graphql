const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const uuidv4 = require('uuid/v4')
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');
const graphqlHttp = require('express-graphql');
const auth = require('./middleware/is-auth');

const app = express();
// const feedRoutes = require('./routes/feed');
// const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
  if(
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } 
  else {
    cb(null, false);
  }
};

app.use(parser.json());
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));

app.use('/', (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if(req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
});

// app.use('/feed', feedRoutes);
// app.use('/auth', authRoutes);
app.use('/images', express.static(path.join(__dirname + '/images')));

//app.use('/', auth);

app.use('/graphql', 
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn: (error) => {
      if(!error.originalError) {
        return error;
      }

      return { message: error.message, status: error.originalError.statusCode };      
    }
  })
);

app.use('/', (err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(statusCode).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://anit-nodejs:Iniqrg0017vZG90f@mongodb-cluster0-onejs.mongodb.net/messages?retryWrites=true&w=majority',
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
  )
  .then(result => {
    app.listen(8191);
  })
  .catch(err => console.log(err));