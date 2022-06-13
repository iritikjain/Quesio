import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const AdminSchema=new mongoose.Schema({
    name:{type:String,required:true},
    phone:{type:Number},
    password:{type:String,required:true},
    email_id:{type:String,required:true},
    university:{type:String,required:true},
},{
    timestamps:true,
});


// Statics
AdminSchema.methods.generateJwtTokenadmin = function () {
    return jwt.sign({ admin: this._id,usertype:"admin" }, "Quesio8bit");
};



export const AdminModel=mongoose.model("admins",AdminSchema);