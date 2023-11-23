import fetch from "cross-fetch";
import { Agent } from "https";
import {
	SavannacomResponse,
	BulkSMSObject,
	BulkSMSResponse,
	BulkSMSResponseError,
} from "./interface";
import { numberCheck } from "./utils";

/**
 * Private function to run the API request.
 *
 * @param id a `string`; **Description:** This is an ID provided by Savannacom. **Example:** 10001 / 20030
 * @param username a `string`; **Description:** This is a name provided by Savannacom. **Example:** Local_council / sportsClub
 * @param number The mobile number the SMS will be sent to
 * @param content This is the message one intends to send as an SMS
 */
const apiCall = async (
	id: string,
	username: string,
	number: string,
	content: string
): Promise<SavannacomResponse> => {
	try {
		const request = await fetch("https://102.23.122.190/hermes/send/sms.php", {
			method: "POST",
			headers: {
				"Content-Type": "text/plain",
			},
			body: JSON.stringify({
				sender_username: username,
				sender_id: id,
				sender_message: content,
				msisdn: number,
			}),
			// @ts-ignore
			agent: new Agent({ rejectUnauthorized: false }),
		});

		const response: SavannacomResponse = await request.json();

		return response;
	} catch (ex) {
		return {
			data: {
				msisdn: number,
				sender_id: id,
				sender_message: content,
				sender_username: username,
			},
			message: "Data not sent",
			status: "Request not sent",
			error: ex as any,
		};
	}
};

/**
 * Send an SMS to a single user. It will only enforce 12 digit numbers beginning with 26, and on the available Zambian carriers.
 *
 * @param id a `string`; **Description:** This is an ID provided by Savannacom. **Example:** 10001 / 20030
 * @param username a `string`; **Description:** This is a name provided by Savannacom. **Example:** Local_council / sportsClub
 * @param number The mobile number the SMS will be sent to; Format 260...
 * @param content This is the message one intends to send as an SMS
 */
export const sendSms = async (
	id: string,
	username: string,
	number: string,
	content: string
): Promise<SavannacomResponse> => {
	const error = numberCheck(number);

	if (error) {
		return {
			data: {
				msisdn: number,
				sender_id: id,
				sender_message: content,
				sender_username: username,
			},
			message: "Data not sent",
			status: "Request not sent",
			error,
		};
	}

	return apiCall(id, username, number, content);
};

/**
 * Send SMS' to multiple users. It will only enforce 12 digit numbers beginning with 26, and on the available Zambian carriers. It ignores duplicates by default; It will simply keep the first entry and ignore any other duplicate phone number entries.
 *
 * **NOTE:** This method is resource intesnive and may be subject to rate limits
 *
 * @param id a `string`; **Description:** This is an ID provided by Savannacom. **Example:** 10001 / 20030
 * @param username a `string`; **Description:** This is a name provided by Savannacom. **Example:** Local_council / sportsClub
 * @param data a custom `BulkSMSObject` array
 * @param withDuplicates if set to `true` it will not clean the data for duplicate entries
 * @returns a custom `BulkSMSResponse`
 */
export const bulkSms = async (
	id: string,
	username: string,
	data: BulkSMSObject[],
	withDuplicates?: boolean
): Promise<BulkSMSResponse> => {
	if (data.length === 0)
		return { errors: [{ number: "N/A", error: "No data provided" }] };

	const cleanedDataWithDuplicates: BulkSMSObject[] = [];
	const duplicatesWithDuplicates: BulkSMSObject[] = [];
	const errorsArray: BulkSMSResponseError[] = [];

	const _blacklist: string[] = [];

	data.map((entry) => {
		const { content, number } = entry;

		const error = numberCheck(number);

		if (error) errorsArray.push({ number, error });
		else {
			if (!_blacklist.includes(number)) {
				_blacklist.push(number);
			} else {
				duplicatesWithDuplicates.push(entry);
			}

			cleanedDataWithDuplicates.push({ number, content });
		}
	});

	const cleanedDataWithoutDuplicates: BulkSMSObject[] = [];
	const duplicatesWithoutDuplicates: BulkSMSObject[] = [];

	if (!withDuplicates) {
		const blacklist: string[] = [];

		cleanedDataWithDuplicates.map((entry) => {
			const { content, number } = entry;

			if (!blacklist.includes(number)) {
				blacklist.push(number);
				cleanedDataWithoutDuplicates.push({ content, number });
			} else {
				duplicatesWithoutDuplicates.push(entry);
			}
		});
	}

	const cleanedData: BulkSMSObject[] = withDuplicates
		? cleanedDataWithDuplicates
		: cleanedDataWithoutDuplicates;

	cleanedData.map(async (entry) => {
		const { content, number } = entry;
		const response = await apiCall(id, username, number, content);

		if (response.status.toLowerCase() !== "successful") {
			errorsArray.push({
				error: response.error ? response.error : response.status,
				number,
			});
		}
	});

	const duplicates = withDuplicates
		? duplicatesWithDuplicates.length === 0
			? undefined
			: duplicatesWithDuplicates
		: duplicatesWithoutDuplicates.length === 0
		? undefined
		: duplicatesWithDuplicates;

	const errors = errorsArray.length === 0 ? undefined : errorsArray;

	return { errors, duplicates };
};
