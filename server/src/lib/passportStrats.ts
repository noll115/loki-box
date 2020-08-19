import { Strategy as jwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { Strategy as localStrategy } from "passport-local";
import { PassportStatic } from "passport";
import { User } from "./mongoDB";


const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
    ignoreExpiration: true,
    algorithms: ["HS256"]
}

export default (passport: PassportStatic) => {
    passport.use("jwt", new jwtStrategy(options, (token, done) => {
        return done(null, token.user)
    }));


    passport.use("register", new localStrategy({
        passwordField: "pass",
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            const user = await User.create({
                email,
                password
            });
            return done(null, user);
        } catch (err) {
            return done(err)
        }
    }))

    passport.use("login", new localStrategy({
        passwordField: "pass",
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: "User not found" });
            }

            if (!(await user.ValidPassword(password))) {
                return done(null, false, { message: "Wrong password!" });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));


}

