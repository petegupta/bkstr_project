const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const linkedin_profile_url = "https://www.linkedin.com/in/md-amzad-475564207/";

class LinkedInScrapper {
    constructor(is_headless = false) {
        this.browser = null;
        this.page = null;
        this.is_headless = is_headless;
    }

    async initialize() {
        this.browser = await puppeteer.launch({ headless: this.is_headless });
        this.page = await this.browser.newPage();
    }

    static async createObject() {
        const scrapper = new LinkedInScrapper(this.is_headless);
        await scrapper.initialize();
        return scrapper;
    }

    async detectCaptcha() {
        try {
            await this.waitForSelector("#home_children_button", { timeout: 5000 });
            await this.waitForSelector("#home_children_button", { hidden: true, timeout: 60000 });
        } catch (error) { }
    }

    async login(email, password) {
        await this.page.goto('https://www.linkedin.com/login');
        await this.page.waitForNetworkIdle();
        let email_selector = "#username";
        let password_selector = "#password";
        while (true) {
            await this.page.type(email_selector, email);
            await this.page.type(password_selector, password);
            await this.page.click('[data-litms-control-urn="login-submit"]', { waitUntil: 'domcontentloaded' });
            try {
                await this.detectCaptcha();
                await this.page.waitForSelector('#email-or-phone');
                console.log("Not logged in. Trying to re-login...");
                email_selector = "#email-or-phone";
            } catch (error) {
                console.log("Login Successful...");
                break;
            }
        }
    }

    async getProfileInfo(linkedin_profile_url) {
        await this.page.goto(linkedin_profile_url);
        let name_selector = "h1.text-heading-xlarge";
        try {
            await this.page.waitForSelector(name_selector, { timeout: 5000 });
            const name = await this.page.$eval(name_selector, element => element.textContent.trim());
            const profile_desc = await this.page.$eval('.text-body-medium.break-words', element => element.textContent.trim());
            const address = await this.page.$eval('.text-body-small.inline.t-black--light.break-words', element => element.textContent.trim());

            return {
                name: name,
                profile_desc: profile_desc,
                address: address,
            }
        } catch (error) {
            console.log("Profile Error: " + error);
        }
    }

    async getExperience() {
        try {
            await this.page.waitForSelector("#experience");
            return await this.page.evaluate(() => {
                const experiences = [];
                var experienceElement = document.getElementById('experience')?.nextElementSibling?.nextElementSibling;
                if (experienceElement != null) {
                    const list_elements = experienceElement.querySelectorAll('li.artdeco-list__item');
                    for (let index = 0; index < list_elements.length; index++) {
                        const element = list_elements[index];
                        const div_element = element.querySelector('[class="display-flex flex-row justify-space-between"').firstElementChild;

                        const position = div_element.children[0]?.textContent?.trim() ?? '';
                        const company_name = div_element.children[1]?.textContent?.trim() ?? '';
                        const working_date = div_element.children[2]?.textContent?.trim() ?? '';
                        const company_address = div_element.children[3]?.textContent?.trim() ?? '';
                        experiences.push({
                            position: position,
                            company_name: company_name,
                            working_date: working_date,
                            company_address: company_address,
                        });
                    }
                }
                return experiences;
            });
        } catch (error) {
            console.log("Experience Error: " + error);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    sanitizeForCSV(value) {
        if (typeof value !== 'string') {
            return value;
        }
    
        const csvUnsafeChars = /[\n\r,"]/g;
        return value.replace(csvUnsafeChars, '');
    }

    getContactDetails(linkedin_id) {
        return fetch(`https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=false&variables=(memberIdentity:${linkedin_id})&queryId=voyagerIdentityDashProfiles.c7452e58fa37646d09dae4920fc5b4b9`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": "ajax:6558536675345568497",
                "cookie": "JSESSIONID=\"ajax:6558536675345568497\";li_at=AQEDATSV75kBW9tsAAABj8Ke1hcAAAGP5qtaF04A0waFVNvyzgAg-5_PbciGa0WQbVMCgXJYFgm3C_uLgHIJ0jFlP5uGglKGISraZoVAYMaAf2u0Vy7rRuxhC9D69ayBROoM582KjtzBzOota6MTq_6d;",
            },
            "body": null,
            "method": "GET"
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            let res = await response.json();
            let included = res.included;
            let data = [];

            for (let index = 0; index < included.length; index++) {
                const element = included[index];

                let linkedin_data = {};

                if (element?.publicIdentifier == "md-amzad-475564207") continue;
                linkedin_data.linkedin_id = element?.publicIdentifier ?? '';
                linkedin_data.first_name = element?.firstName ?? '';
                linkedin_data.last_name = element?.lastName ?? '';
                linkedin_data.headline = element?.headline ?? '';
                linkedin_data.email = (typeof (element?.emailAddress) === 'object') ? (element?.emailAddress?.emailAddress ?? '') : (element?.emailAddress ?? '');
                linkedin_data.mobile_number = Array.isArray(element?.phoneNumbers) ? (element?.phoneNumbers?.join(' | ') ?? '') : (element?.phoneNumbers ?? '');
                linkedin_data.address = element?.address ?? '';
                linkedin_data.twitter = Array.isArray(element?.twitterHandles) ? (element?.twitterHandles?.join(' | ') ?? '') : (element?.twitterHandles ?? '');

                if (Array.isArray(element?.websites)) {
                    for (let web = 0; web < element?.websites.length; web++) {
                        const website = element?.websites[web];
                        if (website instanceof Object) {
                            linkedin_data.websites = website?.url;
                        } else {
                            linkedin_data.websites = website ?? '';
                        }

                        if (this.isValidEmail(linkedin_data.websites)) {
                            linkedin_data.email = linkedin_data.websites.replace("http://", "").replace("https://", "");
                            linkedin_data.websites = '';
                        }
                    }
                } else {
                    linkedin_data.websites = element?.websites ?? '';
                }

                linkedin_data.linkedin_id = this.sanitizeForCSV(linkedin_data.linkedin_id?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.first_name = this.sanitizeForCSV(linkedin_data.first_name?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.last_name = this.sanitizeForCSV(linkedin_data.last_name?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.headline = this.sanitizeForCSV(linkedin_data.headline?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.email = this.sanitizeForCSV(linkedin_data.email?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.mobile_number = this.sanitizeForCSV(linkedin_data.mobile_number?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.address = this.sanitizeForCSV(linkedin_data.address?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.twitter = this.sanitizeForCSV(linkedin_data.twitter?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.websites = this.sanitizeForCSV(linkedin_data.websites?.trim()?.replace(",", " ")?.replace(/\s+/g, ' '));
                linkedin_data.websites = this.sanitizeForCSV((linkedin_data.websites == undefined) ? '' : linkedin_data.websites);
                data.push(linkedin_data);
            }
            return data.filter(obj => Object.values(obj).some(val => val !== ''));
        })
    }

    getCompanyId(company_name) {
        return fetch(`https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:GLOBAL_SEARCH_HEADER,query:(keywords:${encodeURIComponent(company_name)},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(ALL))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.694ac6c1e6ab4545e32292115b87e83c`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": "ajax:6558536675345568497",
                "cookie": "JSESSIONID=\"ajax:6558536675345568497\";li_at=AQEDATSV75kBW9tsAAABj8Ke1hcAAAGP5qtaF04A0waFVNvyzgAg-5_PbciGa0WQbVMCgXJYFgm3C_uLgHIJ0jFlP5uGglKGISraZoVAYMaAf2u0Vy7rRuxhC9D69ayBROoM582KjtzBzOota6MTq_6d;",
            },
            "body": null,
            "method": "GET"
        }).then(async response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            let res = await response.json();
            let included = res.included;

            let company_data = [];
            for (let index = 0; index < included.length; index++) {
                const element = included[index];
                if (!element.hasOwnProperty("trackingUrn")) continue;
                let trackingUrn = element.trackingUrn;
                if (!trackingUrn) continue;

                trackingUrn = trackingUrn.split(":");
                let is_company = (trackingUrn.at(-2) == "company") ? true : false;
                if (!is_company) continue;
                let id = trackingUrn.at(-1);

                company_data.push(id);
            }
            return company_data;
        });
    }

    getCompanyPeoples(company_name, people_name) {
        return this.getCompanyId(company_name)
            .then(async company_ids => {
                var people_data = [];
                for (let index = 0; index < company_ids.length; index++) {
                    const company_id = company_ids[index];
                    
                    let response = await fetch(`https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:FACETED_SEARCH,query:(keywords:${encodeURIComponent(people_name)},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:currentCompany,value:List(${encodeURIComponent(company_id)})),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.694ac6c1e6ab4545e32292115b87e83c`, {
                        "headers": {
                            "accept": "application/vnd.linkedin.normalized+json+2.1",
                            "csrf-token": "ajax:6558536675345568497",
                            "cookie": "JSESSIONID=\"ajax:6558536675345568497\";li_at=AQEDATSV75kBW9tsAAABj8Ke1hcAAAGP5qtaF04A0waFVNvyzgAg-5_PbciGa0WQbVMCgXJYFgm3C_uLgHIJ0jFlP5uGglKGISraZoVAYMaAf2u0Vy7rRuxhC9D69ayBROoM582KjtzBzOota6MTq_6d;",
                        },
                        "body": null,
                        "method": "GET"
                    })
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    let res = await response.json();
                    let included = res?.included;

                    for (let index = 0; index < included.length; index++) {
                        const element = included[index];

                        if (!element.hasOwnProperty('navigationUrl')) continue;

                        // getting profile id
                        let profile_link = element.navigationUrl.split("?")[0];

                        // getting people name
                        let name = element?.title?.text;
                        if (name == "LinkedIn Member") continue;

                        people_data.push({
                            profile_link: profile_link,
                            name: name
                        })
                    }
                }
                return people_data;
            })
    }
}

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

(async () => {
    const scrapper = new LinkedInScrapper;

    // collecting contact data
    // const url_data = await readCSV("url_insert.csv");
    // for (let index = 0; index < url_data.length; index++) {
    //     const element = url_data[index];
    //     console.log(index + 1, element.linkedin);
    //     if (element.linkedin == '' || element.linkedin == undefined) continue;
    //     let regex = /https:\/\/www\.linkedin\.com\/(in|pub|company)\/[^\/\?]+/;
    //     try {
    //         element.linkedin = element.linkedin.match(regex)[0];
    //     } catch (error) {
    //         continue;
    //     }
    //     element.linkedin = element.linkedin.match(regex)[0];
    //     const profile_id = element.linkedin.split("/").at(-1);
    //     if (profile_id == '' || profile_id == undefined) continue;
    //     const profile_data = await scrapper.getContactDetails(profile_id);
    //     console.log(profile_data);
    //     for (let index = 0; index < profile_data.length; index++) {
    //         const profile = profile_data[index];
    //         profile.linkedin_id = "https://www.linkedin.com/in/" + profile.linkedin_id;
    //         writeCSV(Object.values(profile), "LinkedIn User Contact Data.csv");
    //     }
    // }
    // return;

    // collecting url data
    let college_data = await readCSV("insert.csv");

    for (let index = 0; index < college_data.length; index++) {
        const college = college_data[index];
        let name = college.name.trim().replace(/\s+/g, ' ');
        console.log("No: ", index + 1, name);
        if (name == '' || college.org_name == '' || college.org_name == undefined) continue;
        let people_name_arr = name.split(" ");
        let people_name = (people_name_arr.length > 1) ? people_name_arr[people_name_arr.length - 1] : people_name_arr[0];
        let company_peoples = await scrapper.getCompanyPeoples(college.org_name.trim().replace(/\s+/g, ' '), people_name)

        console.log(company_peoples);
        for (let j = 0; j < company_peoples.length; j++) {
            const people = company_peoples[j];
            writeCSV(Object.values(people), "LinkedIn URL Data.csv");
        }
    }
})();