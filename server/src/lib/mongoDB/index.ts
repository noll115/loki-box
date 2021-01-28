import { modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
export * from "./box";
export * from "./user";

if (process.env.DB) {
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        dbName: "loki-box"
    });

    mongoose.connection.on('connected', function () {
        console.log('Mongoose default connection open to ' + process.env.DB);
    });

    mongoose.connection.on('error', function (err) {
        console.log('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose default connection disconnected');
    });

    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });
}
