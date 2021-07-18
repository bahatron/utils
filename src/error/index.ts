type Context = Record<string, any>;

export class Exception extends Error {
    constructor(
        public readonly name: string,
        public readonly message: string,
        public readonly code: number,
        public readonly context: Context = {}
    ) {
        super();
    }
}

export function ValidationFailed(
    message: string = "Validation Failed",
    context?: Context
): Exception {
    return new Exception("ValidationFailed", message, 400, context);
}

export function BadRequest(
    message: string = "Bad Request",
    context?: Context
): Exception {
    return new Exception("BadRequest", message, 400, context);
}

export function NotFound(
    message: string = "Resource not found",
    context?: Context
): Exception {
    return new Exception("NotFound", message, 404, context);
}

export function ExpectationFailed(
    message: string = "Expectation Failed",
    context?: Context
): Exception {
    return new Exception("ExpectationFailed", message, 417, context);
}

export function InternalError(
    message: string = "Internal Error",
    context?: Context
): Exception {
    return new Exception("InternalError", message, 500, context);
}

export function NotImplemented(
    message: string = "Not Implemented",
    context?: Context
): Exception {
    return new Exception("NotImplemented", message, 501, context);
}
