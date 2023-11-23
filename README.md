# savannacom

A fully typed unnoficial Javascript SDK for the Savannacom Hermes SMS API. Unnoficial meaning it is not developed by [Savannacom](www.savannacom.zm) but by [Cerebrus Inc](https://www.cerebrus.dev).

It uses cross-fetch under the hood to enable the platform and environment agnostic usage.

Additionally, the functions and methods include checks to ensure that you are sending a number in the corrcet format. Incorrect numbers are automatically rejected. Duplicate messages are recognised via multiple entries with the same phone number; The same message content will not count as a duplicate message.

**NOTE**

- This is accurate to their API as at 23 Nov 2023.
- Phone number format is `260...` as a 12 digit string.
- One message is defined as having 160 characters, any excess characters will count as additional message(s) of which you will be charged for.

# Importing

```javascript
// ES6 Module
import * as savannacom from "savannacom";

// ES6 Destructuring
import { SMS } from "savannacom";

// Commonjs Module
const savannacom = require("savannacom");

// Commonjs Destructuring
const { SMS } = require("savannacom");
```

You can also add the CDN via `jsDelivr`:

```html
<script src="https://cdn.jsdelivr.net/npm/savannacom@0.3.2/lib/index.js"></script>
```

# Exports

We export the following:

#### SMS(id, username)

This is a class that needs to be instanciated with auth params. The methods are automatically called without need to pass authorusation. The methods are:

- `sendSms(number, content): Promise<SavannacomResponse>`
  - Send a single SMS to a single recipient.
  - Returns a Savannacom API response object.
- `bulkSms(data, withDuplicates?): Promise<BulkSMSResponse>`
  - A custom method to ease sending bulk SMS' to multiple recipients; Note that this method may be subject to rate limits and can be resource intensive if the list is fairly large.
  - By default it will ignore duplicates unless the param is set to true
  - Returns a custom response object with errors and their details, as well as any duplicates and their details.

#### sendSms(id, username, number, content): Promise<SavannacomResponse>

A function to send a single SMS to a single recipient; Requires auth on every call. It operates exaclty like the class based method.

#### bulkSms(is, username, data, withDuplicates?): Promise<BulkSMSResponse>

A custom function to send bulkSms; Requires auth on every call. It operates exaclty like the class based method.

#### BulkSMSObject

This is a custom type not provided by Savannacom; Ideal usage would be if you would like to dynamically generate the details for a bulk sms operation prior to calling the bulkSms function or method.

# Usage

You can use both class based and function based implementions via `async/await` or `promises`.

### Class Based

This is ideal for backend usage wherein you can create an instance on startup and use it without needing to continously pass the auth params on every call.

**example**

```ts
import { SMS } from "savannacom";

const sms = new SMS(process.env.SENDER_ID, process.env.SENDER_USERNAME);

const sendUpdate = async (number, message) => {
	const update = await sms.sendSms(number, message);

	if (update.error) {
		// log errors
	}
};

// we are not passing true to the withDuplicates param, therefore, the operation will not send requests for the duplicated phone number entries
const sendMultipleUpdates = async (data) => {
	const updates = await sms.bulkSms(data);

	if (updates.errors) {
		// log errors
	}

	if (updates.duplicates) {
		// handle duplicates
	}
};

sendUpdate("260970101010", "Test 1");
sendMultipleUpdates([
	{ number: "260970101010", content: "Test 2" },
	{ number: "260970909090", content: "Test 3" },
]);
```

### Function Based

This can be used in the browser or in your favourite framework. It requires auth params on every call so ensure to keep them obfuscated.

```ts
import { sendSms, bulkSms } from "savannacom";

// Promise based example
sendSms("00000", "username", "260970101010", "Test 4")
	.then((update) => {
		// success handler
	})
	.catch((error) => {
		// error handler
	});

// Passing true to param withDuplicates will send the duplicate entries
const sendMultipleUpdates = async (data, withDuplicates) => {
	const updates = await bulkSms("00000", "username", data, withDuplicates);

	if (updates.errors) {
		// log errors
	}

	if (updates.duplicates) {
		// handle duplicates
	}
};

sendMultipleUpdates(
	[
		{ number: "260970101010", content: "Test 4" },
		{ number: "260970101010", content: "Test 5" },
	],
	true
);
```

# Utils

This package comes with some utils to make it more secure to interface with the API. Any errors raised by these checks will not run the request. The following list is in order of importance:

- Phone numbers with non numerical chars will immediately be rejected
- Phone numbers not equal to 12 chars will immediately be reject
- Phone numbers not beginning with 26 will immediately be rejected
- Phone numbers that are not the following will be rejected:
  - 097
  - 077
  - 096
  - 076
  - 095
  - 075
- It does not enforce content length to be less than 160 chars; If you do not want to mistakenly go over the limit you may enforce this on your own

# Types

### SavannacomResponse

The Savannacom API response object.

```ts
{
	status: string;
	message: string;
	data: {
		sender_username: string;
		sender_id: string;
		sender_message: string;
		msisdn: string;
	};
	error?: string;
}
```

### BulkSMSObject

The custom bulk SMS request interface.

```ts
{
	number: string;
	content: string;
}
```

### BulkSMSResponseError

The custom bulk SMS error object.

```ts
{
	number: string;
	error: string;
}
```

### BulkSMSResponse

The cusotom bulk SMS Response object.

```ts
{
	errors?: BulkSMSResponseError[];
	duplicates?: BulkSMSObject[];
}
```

# Changelog

## v0.3.x

<details open>
<summary><strong>v0.3.3</strong></summary>

- Added `bulksms` to package.json keywords
- Added `MIT license

</details>
<br />

<details>
<summary><strong>v0.3.2</strong></summary>

- Added README

</details>
<br />

<details>
<summary><strong>v0.3.1</strong></summary>

- Exported custom type `BulkSMSResponse` and function based functions

</details>
<br />

<details>
<summary><strong>v0.3.0</strong></summary>

- Added function based approach

</details>
<br />

## v0.2.x

<details>
<summary><strong>v0.2.0</strong></summary>

- Added duplicates parameter to `BulkSMSResponse`

</details>
<br />

## v0.1.x

<details>
<summary><strong>v0.1.1</strong></summary>

- Fixed carrier identiier problem

</details>
<br />

<details>
<summary><strong>v0.1.0</strong></summary>

- Initial release
- Added class based approach
- Added interaces

</details>
