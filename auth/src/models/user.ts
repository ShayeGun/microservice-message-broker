import mongoose from "mongoose";
import { compare, hash, genSalt } from 'bcrypt';

// for mongo attributes that user inserts in model by new User()
interface UserAttr {
    email: string;
    password: string;
}

// for mongo internal attributes that automatically gets added to entities like __v or createdAt , ...
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attr: UserAttr): UserDoc;
    comparePassword(plainText: string, hash: string): boolean;

}

const userSchema = new mongoose.Schema<UserAttr>({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        // not show __v, password and change _id to id for consistency in microservices 
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        }
    }
})

userSchema.pre('save', async function (next) {
    const salt = await genSalt(8);
    this.password = await hash(this.password, salt);

    next();
})

userSchema.statics.comparePassword = async (userPass: string, bcryptPass: string) => {
    return await compare(userPass, bcryptPass);
};

userSchema.statics.build = function (attr: UserAttr) {
    return new User(attr);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// const u = User.build({
//     email: 'test@test.com',
//     password: 'password'
// })

export { User }