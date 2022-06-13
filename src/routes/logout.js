//Library
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const Router = express.Router();


// Route: /logout
// Description : logout
// params: none
// Access: Public
// Method : GET
Router.get('/',(req, res)=>{
    res.clearCookie('jwt');
    res.redirect('/login')
  })


export default Router;