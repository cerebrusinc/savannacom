/**
 * Check the phone number to ensure that the Savannacom API receives a valid formatted number each time.
 *
 * @param number The MSISDN
 * @returns a `string` when there is an error, and `undefined` when there is no error
 */
export const numberCheck = (number: string): string | undefined => {
	let regex = /^[0-9]+$/;

	if (!regex.test(number)) return "Number provided is invalid.";

	if (number.length !== 12) return "Number length is incorrect.";

	if (number.substring(0, 2) !== "26") return "Number does not begin with 26.";

	const carrier = number.substring(2, 6);

	switch (carrier) {
		case "097":
			break;
		case "077":
			break;
		case "096":
			break;
		case "076":
			break;
		case "095":
			break;
		case "075":
			break;
		default:
			return "Carrier not allowed.";
	}

	return undefined;
};
