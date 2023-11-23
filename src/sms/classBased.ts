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
 * The SMS class for initialising the SMS instance with credentials to enable simpler sending for a class based approach. Ideal for the server.
 */
export default class SMS {
	/**
	 * **Description:**
	 * This is an ID provided by Savannacom
	 *
	 * **Example:**
	 * 10001 / 20030
	 */
	private sender_id: string;
	/**
	 * **Description:**
	 * This is a name provided by Savannacom
	 *
	 * **Example:**
	 * Local_council / sportsClub
	 */
	private sender_username: string;

	/**
	 * Initialise the class with auth credentials for repeated usage.
	 *
	 * @param id a `string`; **Description:** This is an ID provided by Savannacom. **Example:** 10001 / 20030
	 * @param username a `string`; **Description:** This is a name provided by Savannacom. **Example:** Local_council / sportsClub
	 */
	constructor(id: string, username: string) {
		this.sender_id = id;
		this.sender_username = username;
	}

	/**
	 * Private method to run the API request.
	 *
	 * @param number The mobile number the SMS will be sent to
	 * @param content This is the message one intends to send as an SMS
	 */
	private async apiCall(
		number: string,
		content: string
	): Promise<SavannacomResponse> {
		try {
			const request = await fetch(
				"https://102.23.122.190/hermes/send/sms.php",
				{
					method: "POST",
					headers: {
						"Content-Type": "text/plain",
					},
					body: JSON.stringify({
						sender_username: this.sender_username,
						sender_id: this.sender_id,
						sender_message: content,
						msisdn: number,
					}),
					// @ts-ignore
					agent: new Agent({ rejectUnauthorized: false }),
				}
			);

			const response: SavannacomResponse = await request.json();

			return response;
		} catch (ex) {
			return {
				data: {
					msisdn: number,
					sender_id: this.sender_id,
					sender_message: content,
					sender_username: this.sender_username,
				},
				message: "Data not sent",
				status: "Request not sent",
				error: ex as any,
			};
		}
	}

	/**
	 * Send an SMS to a single user. It will only enforce 12 digit numbers beginning with 26, and on the available Zambian carriers.
	 *
	 * @param number The mobile number the SMS will be sent to
	 * @param content This is the message one intends to send as an SMS
	 */
	public async sendSms(
		number: string,
		content: string
	): Promise<SavannacomResponse> {
		const error = numberCheck(number);

		if (error) {
			return {
				data: {
					msisdn: number,
					sender_id: this.sender_id,
					sender_message: content,
					sender_username: this.sender_username,
				},
				message: "Data not sent",
				status: "Request not sent",
				error,
			};
		}

		return this.apiCall(number, content);
	}

	/**
	 * Send SMS' to multiple users. It will only enforce 12 digit numbers beginning with 26, and on the available Zambian carriers. It ignores duplicates by default; It will simply keep the first entry and ignore any other duplicate phone number entries.
	 *
	 * **NOTE:** This method is resource intesnive and may be subject to rate limits
	 *
	 * @param data a custom `BulkSMSObject` array
	 * @param withDuplicates if set to `true` it will not clean the data for duplicate entries
	 * @returns a custom `BulkSMSResponse`
	 */
	public async bulkSms(
		data: BulkSMSObject[],
		withDuplicates?: boolean
	): Promise<BulkSMSResponse> {
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
			const response = await this.apiCall(number, content);

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
	}
}
