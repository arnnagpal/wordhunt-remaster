// deno-lint-ignore-file no-explicit-any
import mongoose from "mongoose";
import { UserRole } from "../../types/user-role";

export class MongoUserRole extends mongoose.SchemaType {
    constructor(key: string, options: mongoose.AnyObject | undefined) {
        super(key, options, "UserRole");
    }

    override cast(val: any) {
        if (val == null) return "";
        if (typeof val !== "string") {
            throw new Error("UserRole: val is not a string");
        }

        if (val !== UserRole.Admin && val !== UserRole.User) {
            throw new Error("UserRole: val is not a valid UserRole");
        }

        return val;
    }
}
