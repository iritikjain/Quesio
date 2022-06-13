import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminModel } from "./admin";


const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String },
    password: { type: String },
    email_id: { type: String, required: true },
    university: { type: String, required: true },
    college: { type: String, required: true },
    phone: { type: Number },
    question_submited: [{ type: mongoose.Types.ObjectId, ref: "questions" }],
    question_validated: [{ type: mongoose.Types.ObjectId, ref: "questions" }],
    subject: [{ subject_name: String, yearofexp: Number }],
    document: { type: String },
    isExpert: { type: Number, default: 0 },
    isFaculty: { type: Number, default: 0 },
    isVarified: { type: Number, default: 0 },
    branch: { type: String, required: true }
}, {
    timestamps: true,
});



// Statics
UserSchema.methods.generateJwtToken = function () {
    if (this.isExpert) {
        return jwt.sign({ user: this._id, usertype: "expert" }, "Quesio8bit");
    } else {
        return jwt.sign({ user: this._id, usertype: "faculty" }, "Quesio8bit");
    }
};


UserSchema.statics.findByEmailAndPassword = async (password, email) => {
    //check if admin or not
    const admin = await AdminModel.findOne({ email_id: email });
    console.log(admin)
    if (!admin) {
       
        // check whether email exists
        const user = await UserModel.findOne({ email_id: email });
        if (!user) return "User Does not exist"

        //check if user irs verified
        if (!user.isVarified) return "You are not verified yet try after sometime"
        // Compare password
        const doesPasswordMatch = await bcrypt.compare(password, user.password);
        if (!doesPasswordMatch) return "Invalid Credentials!!!";

       
        return { user, "isuser": true, };
    } else {
        
        // Compare password
        const doesPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!doesPasswordMatch)  return "Invalid Credentials!!!";
       
        return { admin, "isuser": false };
    }


};


UserSchema.statics.findByEmail = async (email) => {
    //check whether email exists
    const checkUserByEmail = await UserModel.findOne({ email_id: email });

    if (checkUserByEmail) {
        throw new Error("User Already Exists...!");
    }

    return false;
};

UserSchema.pre("save", function (next) {
    const user = this;

    //password is modified
    if (!user.isModified("password")) return next();

    //password bcrypt salt
    bcrypt.genSalt(8, (error, salt) => {
        if (error) return next(error);

        //hash the password
        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) return next(error);

            //assigning hashed password
            user.password = hash;
            return next();
        });
    });
});


export const UserModel = mongoose.model("users", UserSchema);