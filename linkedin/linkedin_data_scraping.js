const puppeteer = require('puppeteer');
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
}

(async () => {
    const scrapper = await LinkedInScrapper.createObject();
    await scrapper.login("mohd.amzad@ucertify.com", "Amzad6@husain");
    const profile_info = await scrapper.getProfileInfo(linkedin_profile_url)
    const experience = await scrapper.getExperience();
    console.log(experience);
})();