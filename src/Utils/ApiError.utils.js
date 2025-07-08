export class ApiError {
        constructor(
            statuscode,
            message="Something went wrong",
            errors=[],
            stack=""
        ){
            this.statuscode = statuscode; // HTTP status code for the error
            this.message = message; // Error message to be returned
            this.errors = errors; // Array of error details, if any
            this.data=null; // Data to be returned in the response, if any
            this.success = false; // Indicates that the request was not successful

            if(stack){
                this.stack = stack; // Stack trace for debugging, if provided
            }else{
                Error.captureStackTrace(this, this.constructor); // Capture stack trace if not provided
            }
        }
}