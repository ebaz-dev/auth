import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signIn";
import { signUpRouter } from "./routes/signUp";
import { signOutRouter } from "./routes/signOut";
import { currentUser, errorHandler, NotFoundError } from "@ebazdev/core";
import cookieSession from "cookie-session";
import * as dotenv from "dotenv";
dotenv.config();

const apiPrefix = "/api/v1/users";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: true,
    secure: process.env.NODE_ENV !== "local",
    keys: [process.env.JWT_KEY!],
  })
);

app.use(currentUser);
app.use(apiPrefix, currentUserRouter);
app.use(apiPrefix, signInRouter);
app.use(apiPrefix, signUpRouter);
app.use(apiPrefix, signOutRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
