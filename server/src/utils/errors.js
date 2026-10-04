/** An error that carries an HTTP status code and is safe to show to clients. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
