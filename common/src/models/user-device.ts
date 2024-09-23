import mongoose, { Document, Schema } from "mongoose";
import { DeviceTypes } from "../types/device-types";

export interface UserDeviceDoc extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  deviceToken?: string;
  deviceType: DeviceTypes;
  deviceName: string;
  isLogged: boolean;
  loginTime: Date;
  logoutTime?: Date;
}

const userDeviceSchema = new Schema<UserDeviceDoc>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    deviceToken: { type: String, unique: true, sparse: true },
    deviceType: {
      type: String,
      enum: Object.values(DeviceTypes),
      required: true,
    },
    deviceName: { type: String, required: false },
    isLogged: { type: Boolean, required: true },
    loginTime: { type: Date, required: true, default: Date.now },
    logoutTime: { type: Date, required: false },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const UserDevice = mongoose.model<UserDeviceDoc>(
  "UserDevice",
  userDeviceSchema
);

export { UserDevice };
