import express from 'express';
import path from 'path';
require('dotenv').config();
import cors from 'cors';

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import jwt_decode from "jwt-decode"

// Initialize express
const app = express();

// Database Connection
import ConnectDB from './db/connection';

// Routes
import Login from './routes/user';
import Register from './routes/register';
import Questions from './routes/questions';
import Admin from './routes/admin';
import Moderator from './routes/moderator'
import Faculty from './routes/faculty'
import Logout from './routes/logout';
import QBGenerate from './routes/qbgenerate'


// Schemas
import { UserModel } from './models/user';
import { QuestionModel } from './models/question';

// Setting Paths
const static_path = path.join(__dirname, '../public');
const templates_path = path.join(__dirname, '../templates/views');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set('view engine', 'ejs');
app.set('views', templates_path);
app.use(cookieParser())

// Home Page
app.get('/', async (req, res) => {
 try {
  let signup=false;
  const token=req.cookies.jwt
  let usertype=''
  if(token){
    usertype= jwt_decode(req.cookies.jwt).usertype;
    signup=true
  }
  res.render('home',{signup,usertype});
 } catch (error) {
   res.send(error)
 }

});


 

// Microservices
app.use('/login', Login);
app.use('/register', Register);
app.use('/questions',Questions);
app.use('/admin',Admin);
app.use('/moderator',Moderator);
app.use('/faculty',Faculty);
app.use('/logout',Logout);
app.use('/qbgenerate',QBGenerate);

app.listen(process.env.PORT, () =>
  ConnectDB()
    .then(() => console.log('Server is up and running'))
    .catch(() =>
      console.log('Server is running , but database connection failed')
    )
);