import mongoose from "mongoose";
const CollegeSchema = new mongoose.Schema({
    university: { type: String },
    college_name: { type: String, required: true },
    branch: [{ type: String }],
    
}, {
    timestamps: true,
});

export const CollegeModel = mongoose.model("colleges", CollegeSchema); 
