import jwt from "jsonwebtoken";

export default function isAuth (req, res, next){
  const token=req.cookies.jwt
  if(token == null) return res.sendStatus(401);
  jwt.verify(token, 'Quesio8bit',(err,user)=>{
    if(err) return res.sendStatus(403)
    req.mytoken=token
    next()
  })
};

