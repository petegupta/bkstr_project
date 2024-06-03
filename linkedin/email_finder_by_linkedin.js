const fs = require('fs');
const csv = require('csv-parser');
const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvamF3aXdlQHRlbGVnLmV1IiwiZmlyc3ROYW1lIjoiQXNydCIsImxhc3ROYW1lIjoiU2FsZiIsImVtYWlsVmVyaWZpZWQiOnRydWUsInBob25lVmVyaWZpZWQiOmZhbHNlLCJoYXNSaXNrU2NvcmUiOmZhbHNlLCJoYXNMaW1pdGVkUGxhbiI6ZmFsc2UsIndvcmtzcGFjZUlkIjo1NDYxODgsImlzQWRtaW4iOnRydWUsInF1YWxpZmljYXRpb24iOmZhbHNlLCJpc1RlbXAiOmZhbHNlLCJfaWQiOiI2NjVkODRkYzMwZWMzNTFhMDQ3NTY0YmYiLCJzaG93TGVhZFRvdXIiOmZhbHNlLCJ0YXgiOjAsImlhdCI6MTcxNzQwNDkwMSwiZXhwIjoxNzIxOTg4OTAxfQ.89JZX4F3NmIKxZOSkZO4oXECWHGzV6uBjqchnzcrFgU";

(async () => {
	const csv_data = await readCSV("linkedin_user_data.csv");

	for (let index = 0; index < csv_data.length; index++) {
		const element = csv_data[index];
		console.log(index + 1, element.linkedin_id);
		if (element.email != '') continue;
		let response = await fetch(`https://api.getprospect.com/api/v1/insights/search/contact?linkedinUrl=${encodeURIComponent(element.linkedin_id)}`, {
			"headers": {
				"accept": "application/json, text/plain, */*",
				"authorization": token,
			},
			"body": null,
			"method": "GET"
		});

		if (!response.ok) {
			console.log(response.statusText, response.status);
			if (response.status == 402) {
				break;
			}
		}
		response = await response.json();
		element.headline = sanitizeForCSV((response?.position ?? element.headline));
		element.email = sanitizeForCSV((response?.email ?? element.email));
		if (response?.contactInfo) {
			if (response?.contactInfo?.includes('http') || response?.contactInfo?.includes('https')) {
				element.websites = sanitizeForCSV(response?.contactInfo);
			}
		}
		console.log(element);
		if (element.email != '') {
			writeCSV(Object.values(element), "LinkedIn User Final Data.csv");
		}
	}
})();

async function readCSV(fileName) {
	return new Promise((resolve, reject) => {
		const data = [];

		fs.createReadStream(fileName)
			.pipe(csv())
			.on('data', (row) => {
				// Replace spaces with underscores and convert keys to lowercase
				const modifiedRow = {};
				for (const key in row) {
					if (Object.prototype.hasOwnProperty.call(row, key)) {
						const modifiedKey = key.replace(/\s/g, '_').toLowerCase();
						modifiedRow[modifiedKey] = row[key];
					}
				}
				data.push(modifiedRow);
			})
			.on('end', () => {
				resolve(data);
			})
			.on('error', (error) => {
				reject(error);
			});
	});
}

function writeCSV(data, fileName = 'output.csv') {
	try {
		const csvData = data.join(',') + "\n";

		fs.appendFileSync(fileName, csvData, 'utf-8');
	} catch (error) {
		console.error('Error writing CSV file:', error);
	}
}

function sanitizeForCSV(value) {
	if (typeof value !== 'string') {
		return value;
	}

	const csvUnsafeChars = /[\n\r,"]/g;
	return value.replace(csvUnsafeChars, '');
}