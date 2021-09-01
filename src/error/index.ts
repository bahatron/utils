export class Exception extends Error {
    constructor(
        public readonly name: string,
        public readonly message: string,
        public readonly code: string | number,
        public readonly context?: any
    ) {
        super();
    }
}

export function ValidationFailed(
    message: string = "Validation Failed",
    context?: Exception["context"]
): Exception {
    return new Exception("ValidationFailed", message, 400, context);
}

export function BadRequest(
    message: string = "Bad Request",
    context?: Exception["context"]
): Exception {
    return new Exception("BadRequest", message, 400, context);
}

export function Unauthorized(
    message: string = "Resource not found",
    context?: Exception["context"]
): Exception {
    return new Exception("Unauthorized", message, 401, context);
}

export function Forbidden(
    message: string = "Resource not found",
    context?: Exception["context"]
): Exception {
    return new Exception("Forbidden", message, 403, context);
}

export function NotFound(
    message: string = "Resource not found",
    context?: Exception["context"]
): Exception {
    return new Exception("NotFound", message, 404, context);
}

export function NotAcceptable(
    message: string = "Resource not found",
    context?: Exception["context"]
): Exception {
    return new Exception("NotAcceptable", message, 406, context);
}

export function ExpectationFailed(
    message: string = "Expectation Failed",
    context?: Exception["context"]
): Exception {
    return new Exception("ExpectationFailed", message, 417, context);
}

export function InternalError(
    message: string = "Internal Error",
    context?: Exception["context"]
): Exception {
    return new Exception("InternalError", message, 500, context);
}

export function NotImplemented(
    message: string = "Not Implemented",
    context?: Exception["context"]
): Exception {
    return new Exception("NotImplemented", message, 501, context);
}
