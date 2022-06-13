import mongoose from "mongoose";
const SubjectSchema=new mongoose.Schema({
    subject_name:{type:String,required:true},
    chapter:[{type:String}],
    branch:{type:String,required:true},
},{ 
    timestamps:true,
});

export const SubjectModel=mongoose.model("subjects",SubjectSchema); 
