import express from "express";
import "./lib/mongoDB";
import boxRoute from "./routes/box";
import authRoute from "./routes/login";
import passport from "passport";

const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())

app.use("/auth", authRoute(passport));
app.use("/box", boxRoute(passport));


app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})