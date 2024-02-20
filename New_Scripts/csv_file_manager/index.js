import fs from 'fs';
import csv from 'csv-parser';
import { Parser } from 'json2csv';

export async function readCSV(fileName) {
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

export function removeDuplicates(data, key) {
    const uniqueData = [];
    const seenKeys = new Set();

    for (const item of data) {
        const keyValue = item[key].toLowerCase();
        if (!seenKeys.has(keyValue) && !keyValue.includes('test')) {
            seenKeys.add(keyValue);
            uniqueData.push(item);
        }
    }

    return uniqueData;
}

export function removeSpecificEmail(data, key, email_substr) {
    let refactoredData = [];
    for (const item of data) {
        const keyValue = item[key];
        let flag = false;
        for (let i = 0; i < email_substr.length; i++) {
            if (keyValue.includes(email_substr[i])) {
                flag = true;
                break;
            }
        }
        if(!flag){
            refactoredData.push(item);
        };
    }
    return refactoredData;
}

export function writeCSV(data, fileName = 'output.csv') {
    try {
        const csvData = data.join(',') + "\n";

        fs.appendFileSync(fileName, csvData, 'utf-8');
    } catch (error) {
        console.error('Error writing CSV file:', error);
    }
}
