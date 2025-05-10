import {JWTPayload} from "./util/interface";

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload
        }
    }
}