export class Apiresponse{
    constructor(statuscode,data,message='success', ) {
        this.message = message; // Response message
        this.data = data; // Data to be returned in the response
        this.success=statuscode<400; // Indicates if the request was successful
        this.statuscode = statuscode; // HTTP status code for the response
    }
}