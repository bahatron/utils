export class Exception extends Error {
    constructor(
        public readonly name: string,
        public readonly message: string,
        public readonly code: string | number,
        public readonly context?: any,
    ) {
        super();
    }
}

export function ValidationFailed(
    context?: Exception["context"],
    message: string = "Validation Failed",
): Exception {
    return new Exception("ValidationFailed", message, 400, context);
}

export function BadRequest(
    context?: Exception["context"],
    message: string = "Bad Request",
): Exception {
    return new Exception("BadRequest", message, 400, context);
}

export function Unauthorized(
    context?: Exception["context"],
    message: string = "Resource not found",
): Exception {
    return new Exception("Unauthorized", message, 401, context);
}

export function PaymentRequired(
    context?: Exception["context"],
    message: string = "Payment Required",
): Exception {
    return new Exception("PaymentRequired", message, 402, context);
}

export function Forbidden(
    context?: Exception["context"],
    message: string = "Forbidden",
): Exception {
    return new Exception("Forbidden", message, 403, context);
}

export function NotFound(
    context?: Exception["context"],
    message: string = "Resource not Found",
): Exception {
    return new Exception("NotFound", message, 404, context);
}

export function NotAcceptable(
    context?: Exception["context"],
    message: string = "Not Acceptable",
): Exception {
    return new Exception("NotAcceptable", message, 406, context);
}

export function TimeOut(
    context?: Exception["context"],
    message: string = "Request Timed Out",
): Exception {
    return new Exception("TimeOut", message, 408, context);
}

export function Conflict(
    context?: Exception["context"],
    message: string = "Resource Conflict",
): Exception {
    return new Exception("Conflict", message, 409, context);
}

export function Gone(
    context?: Exception["context"],
    message: string = "Resource Gone",
): Exception {
    return new Exception("Gone", message, 410, context);
}

export function PreconditionFailed(
    context?: Exception["context"],
    message: string = "Precondition Failed",
): Exception {
    return new Exception("PreconditionFailed", message, 412, context);
}

export function PayloadTooLarge(
    context?: Exception["context"],
    message: string = "Payload Too Large",
): Exception {
    return new Exception("PayloadTooLarge", message, 413, context);
}

export function URITooLong(
    context?: Exception["context"],
    message: string = "URI Too Long",
): Exception {
    return new Exception("URITooLong", message, 414, context);
}

export function UnsupportedMediaType(
    context?: Exception["context"],
    message: string = "Unsupported Media Type",
): Exception {
    return new Exception("UnsupportedMediaType", message, 415, context);
}

export function ExpectationFailed(
    context?: Exception["context"],
    message: string = "Expectation Failed",
): Exception {
    return new Exception("ExpectationFailed", message, 417, context);
}

export function UnprocessableEntity(
    context?: Exception["context"],
    message: string = "Unprocessable Entity",
): Exception {
    return new Exception("UnprocessableEntity", message, 429, context);
}

export function TooManyRequests(
    context?: Exception["context"],
    message: string = "Too Many Requests",
): Exception {
    return new Exception("TooManyRequests", message, 429, context);
}

export function InternalError(
    context?: Exception["context"],
    message: string = "Internal Error",
): Exception {
    return new Exception("InternalError", message, 500, context);
}

export function NotImplemented(
    context?: Exception["context"],
    message: string = "Not Implemented",
): Exception {
    return new Exception("NotImplemented", message, 501, context);
}
