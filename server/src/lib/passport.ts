import { Strategy as jwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { Strategy as localStrategy } from "passport-local";
import { boxModel, userModel, Roles } from "./mongoDB";
import { BoxSocket, JWTBoxData, JWTUserData, UserSocket } from "../types/general";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import passport from "passport";

const userOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.USER_SECRET,
    ignoreExpiration: true,
    algorithms: ["HS256"]
}

const boxOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.BOX_SECRET,
    ignoreExpiration: true,
    algorithms: ["HS256"]
}


passport.use("box-jwt", new jwtStrategy(boxOptions, async (token: JWTBoxData, done) => {
    try {
        let box = await boxModel.findById(token.user.id);
        if (box) {
            return done(null, box)
        }
        done(null, false, { message: "Not found" })
    } catch (err) {
        done(err);
    }
}));

passport.use("user-jwt", new jwtStrategy(userOptions, async (token: JWTUserData, done) => {
    try {
        let user = await userModel.findById(token.user.id);
        if (user) {
            return done(null, user);
        }
        done(null, false, { message: "Not found" });
    } catch (err) {
        done(err)
    }
}))

passport.use("login", new localStrategy({
    passwordField: "pass",
    usernameField: "email"
}, async (email, password, done) => {
    try {
        let user = await userModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: "User not found" });
        }
        let valid = await user.isValidPassword(password);
        if (!valid) {
            return done(null, false, { message: "Wrong password" });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));


function SocketVerifyUserJWT(socket: Socket, next: (err?: ExtendedError | undefined) => void) {
    let userSocket = <UserSocket>socket;
    console.log('user');
    
    passport.authenticate('user-jwt', { session: false }, (err, user, info) => {
        if (!user || err) return userSocket.emit('jwt_failed');

        userSocket.user = user;
        next();
    })(userSocket.request, {}, next)
}


function SocketVerifyBoxJWT(socket: Socket, next: (err?: ExtendedError | undefined) => void) {
    let boxSocket = <BoxSocket>socket;
    
    passport.authenticate('box-jwt', { session: false }, (err, box, info) => {
        if (!box || err) return boxSocket.emit('jwt_failed')

        boxSocket.box = box;
        next();
    })(boxSocket.request, {}, next)
}


export default passport;

export { SocketVerifyUserJWT, SocketVerifyBoxJWT }



