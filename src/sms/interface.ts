/**The Savannacom API response object with a few modifications for easier use */
export interface SavannacomResponse {
	/**The request status */
	status:
		| "successful"
		| "user not valid"
		| "Mobile number must be 10 digits"
		| "Only digits allowed for mobile number allowed"
		| "Request not sent";
	/**The request status explanation */
	message: "Data received successfully" | "Data not sent";
	/**The request data */
	data: {
		/**Your auth username */
		sender_username: string;
		/**Your auth id */
		sender_id: string;
		/**The SMS content */
		sender_message: string;
		/**The recipient's phone number */
		msisdn: string;
	};
	/**If a non POST method is used; It is a string referring to the error in question. We run our own checks to ensure*/
	error?: string;
}

/**The custom bulk SMS request interface */
export interface BulkSMSObject {
	/**The recipient's phone number */
	number: string;
	/**The message content */
	content: string;
}

/**The custom bulk SMS error object */
export interface BulkSMSResponseError {
	/**The recipient's phone number */
	number: string;
	/**The error regarding the bulk sms entry */
	error: string;
}

/**The cusotom bulk SMS Response Object */
export interface BulkSMSResponse {
	errors?: BulkSMSResponseError[];
	duplicates?: BulkSMSObject[];
}
