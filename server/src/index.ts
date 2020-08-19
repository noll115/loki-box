import express, { ErrorRequestHandler } from "express";
import "./lib/mongoDB";
import boxRoute from "./routes/box";
import authRoute from "./routes/auth";
import passport from "passport";
import SetUpStrategies from "./lib/passportStrats";



const app = express();
SetUpStrategies(passport);

app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())

app.use("/auth", authRoute(passport));
app.use("/box", boxRoute(passport));

let ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err);
    res.status(500).send("Something went wrong!");
}


app.use(ErrorHandler)


app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})