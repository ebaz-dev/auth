import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  BadRequestError,
  recognizePhoneNumber,
} from "@ebazdev/core";
import { UserDevice, DeviceTypes, User } from "../shared";
import { Password } from "../shared/utils/password";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/signIn",
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("phoneNumber")
      .optional()
      .isLength({ min: 8, max: 8 })
      .custom((value) => {
        const recognized = recognizePhoneNumber(value);
        return recognized.found;
      })
      .withMessage("Phone number must be valid"),
    body("password").trim().notEmpty().withMessage("You must apply password"),
    body()
      .custom((value) => {
        if (!value.email && !value.phoneNumber) {
          return false;
        }
        return true;
      })
      .withMessage("Either email or phone number is required"),
    body("deviceToken")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("deviceToken must be valid"),
    body("deviceType")
      .custom((value) => {
        if (!Object.values(DeviceTypes).includes(value)) {
          return false;
        }
        return true;
      })
      .withMessage(`deviceType must be valid ${Object.values(DeviceTypes)}`),
    body("deviceName")
      .trim()
      .notEmpty()
      .withMessage("deviceType must be valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      email,
      phoneNumber,
      password,
      deviceToken,
      deviceType,
      deviceName,
    } = req.body;

    let existingUser;

    if (email) {
      existingUser = await User.findOne({ email, isEmailConfirmed: true });
    } else if (phoneNumber) {
      existingUser = await User.findOne({
        phoneNumber,
        isPhoneConfirmed: true,
      });
    }

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    let existingDevice = await UserDevice.findOne({ deviceToken });

    if (!existingDevice) {
      existingDevice = new UserDevice({
        userId: existingUser.id,
        deviceName,
        deviceType,
        deviceToken,
        isLogged: true,
      });
    } else {
      existingDevice.isLogged = true;
    }
    await existingDevice.save();

    const identifier = email || phoneNumber;

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        identifier: identifier,
        deviceId: existingDevice.id,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(StatusCodes.OK).send(existingUser);
  }
);

export { router as signInRouter };
