import JWT from "jsonwebtoken";
import 'dotenv/config'

const PASSWORD_SECRET = process.env.PASSWORD_SECRET;

function createTokenForUser(user) {
    const payload = {
        
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    const token = JWT.sign(payload, PASSWORD_SECRET);
    return token;
}

function validateToken(token){
    const payload= JWT.verify(token, PASSWORD_SECRET);
    return payload;
}

export{
    createTokenForUser,
    validateToken,
};