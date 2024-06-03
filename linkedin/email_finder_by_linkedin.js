const fs = require('fs');
const csv = require('csv-parser');
const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJpZG9xb0BwZWxhZ2l1cy5uZXQiLCJmaXJzdE5hbWUiOiJBc3J0IiwibGFzdE5hbWUiOiJTYWxmIiwiZW1haWxWZXJpZmllZCI6dHJ1ZSwicGhvbmVWZXJpZmllZCI6ZmFsc2UsImhhc1Jpc2tTY29yZSI6ZmFsc2UsImhhc0xpbWl0ZWRQbGFuIjpmYWxzZSwid29ya3NwYWNlSWQiOjU0NTIwNiwiaXNBZG1pbiI6dHJ1ZSwicXVhbGlmaWNhdGlvbiI6ZmFsc2UsImlzVGVtcCI6ZmFsc2UsIl9pZCI6IjY2NTljMDc2MzBlYzM1MWEwNDczMjJjNiIsInNob3dMZWFkVG91ciI6ZmFsc2UsInRheCI6MCwiaWF0IjoxNzE3MTU4MDE4LCJleHAiOjE3MjE3NDIwMTh9.qfY6kTOI4m-GyOoHp4RdY7HKsBnmHo_VVGc9Mbq0664";

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