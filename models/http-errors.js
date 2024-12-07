class HttpError extends Error {
    constructor(message, errorCode) {
        super(message) // adderror message
        this.code = errorCode // add error code
    }
}

module.exports = HttpError