import { ns } from "express-http-context";
import { Logger } from "./logger";
export * from "./logger.constants";
export * from "./logger.interfaces";

export { Logger };

export default Logger({ id: () => ns.get("requestId") });
