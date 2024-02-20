import fetch from 'node-fetch';
import { readCSV, writeCSV, removeSpecificEmail } from "../New_Scripts/csv_file_manager/index.js";

const apiKey = 'c1b4b6a557ab5d539465133bc6054cc41ade1e09';
const baseUrl = 'https://api.hunter.io/v2/domain-search';

async function fetchEmailData(domain) {
    if (domain == '') return;
    const url = `${baseUrl}?domain=${domain}&department=it,education&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data.emails || [];
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

(async () => {
    const fileName = 'sample.csv';
    const output_file = 'hunter_data5.csv';
    const records = await readCSV(fileName);
    for (let index = 0; index < records.length; index++) {
        const record = records[index];
        var emails = await fetchEmailData(record.url);
        if (emails == undefined) continue;
        console.log(emails);
        emails.forEach(element => {
            let mail_users = ['webmaster', 'admin', 'students', 'development', 'info'];
            let flag = false;
            for (let i = 0; i < mail_users.length; i++) {
                if ((element.value).includes(mail_users[i])) {
                    flag = true;
                }
            }
            if(flag){
                return;
            };
            let email_data = [record.url];
            email_data.push(element.value);
            let name = '';
            if (element.first_name != null) {
                name += element.first_name;
            }
            if (element.last_name != null) {
                name += " " + element.last_name;
            }
            email_data.push(name);
            if (element.department != null) {
                email_data.push(element.department);
            }
            if (element.position != null) {
                email_data.push(element.position);
            }
            writeCSV(email_data, output_file);
        });
        console.log(index);
    }
})();