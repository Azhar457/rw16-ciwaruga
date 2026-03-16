import { randomInt } from "crypto";

export function generateOTP(): string {
    return randomInt(100000, 999999).toString();
}

export function getOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes
    return expiry;
}
