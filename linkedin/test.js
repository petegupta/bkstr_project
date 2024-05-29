const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const linkedin_id = "raj-maurya-73a9311ab";

fetch(`https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=false&variables=(memberIdentity:${linkedin_id})&queryId=voyagerIdentityDashProfiles.c7452e58fa37646d09dae4920fc5b4b9`, {
	"headers": {
		"accept": "application/vnd.linkedin.normalized+json+2.1",
		"accept-language": "en-US,en;q=0.9",
		"csrf-token": "ajax:6558536675345568497",
		"priority": "u=1, i",
		"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"macOS\"",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-origin",
		"x-li-lang": "en_US",
		"x-li-page-instance": "urn:li:page:d_flagship3_profile_view_base_contact_details;mBvyvuk4Sh+S1sOTkACT9Q==",
		"x-li-track": "{\"clientVersion\":\"1.13.17259\",\"mpVersion\":\"1.13.17259\",\"osName\":\"web\",\"timezoneOffset\":5.5,\"timezone\":\"Asia/Calcutta\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":2,\"displayWidth\":2880,\"displayHeight\":1800}",
		"x-restli-protocol-version": "2.0.0",
		"cookie": "li_sugr=b9a4dbea-0a07-4983-ab23-c99608b094b5; bcookie=\"v=2&3f49b812-4f4c-44ba-8c21-1f4e418867c4\"; bscookie=\"v=1&2023121111493732024837-8661-451d-872e-037a5929ec1eAQFrmga8ZBute6SfZOXr7I4IoVe6z3Up\"; li_theme=light; li_theme_set=app; dfpfpt=6f80a4cef20b476bae22c46659d8acd1; timezone=Asia/Calcutta; AnalyticsSyncHistory=AQKxQXCzcK3DjwAAAY-5PmKov0fuX-BfGUAMMp7jsV64w-kjBAM_2U03dorQIxJL51V-hyayaBFEQeqv5qTQAQ; _guid=37af4820-e901-4789-befb-936fbf5bc192; lms_ads=AQEnfvGBtsMGbQAAAY-5PmQsqh6W3NkwlR1rg2vcN0aaHzDwIJTrtbAuOi293h6A_h8hpEWlfd6MetR8-tN2KCOfFfav1hJI; lms_analytics=AQEnfvGBtsMGbQAAAY-5PmQsqh6W3NkwlR1rg2vcN0aaHzDwIJTrtbAuOi293h6A_h8hpEWlfd6MetR8-tN2KCOfFfav1hJI; li_rm=AQH0uvNFF1klLAAAAY-5PyiRGGprPl168qkU6OcqslQqONvPhWzsLqB3xPodduAtAk-MEfjDeUXc7Opo9qrGFK-VkOSxwtA1ejwXVWbABn5uUeOTaSrdFKkp; visit=v=1&M; aam_uuid=60379883444761575882316410275115480241; _gcl_au=1.1.1628982381.1716799897; JSESSIONID=\"ajax:6558536675345568497\"; lang=v=2&lang=en-us; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-637568504%7CMCIDTS%7C19873%7CMCMID%7C59819252581087122872371890552143628154%7CMCAAMLH-1717561709%7C12%7CMCAAMB-1717561709%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1716964109s%7CNONE%7CvVersion%7C5.1.1%7CMCCIDH%7C2087535828; g_state={\"i_l\":1,\"i_p\":1716964182837}; fid=AQGlCxYeJ5sSlAAAAY_CnnBIKBtabKmpxd9udgcmpDw64d0p_trNMha_BGnY7O4trMXvQ_rsdYlRyA; fcookie=AQFma0-JymaGDAAAAY_CntDkqUxkDQ4Kqmdg8a-gha2JQneReFTPqnQ8ubcakZGQPAMC-QSDi1tnf39SpXiMSkz0BDoPvaEhHFmrb7Drmr940ZdRB_f8vP2ZoCqElUu647YoiWzhFhTlczH5Od8M_AbNjLVEMszPS5EHkQ-vgfzyf-bmfNNyZ0_PCvWztl8bSLwf8v2eCUr3i3M83jsWBe7MGIAtIqcxvhxSAgTF8rAmYZFL8gLS4yjCkwgPa/whIwFpsz4QbsL19/lcjeoAoRTdFUAMdG4+un6vdUvyYTdZs0QGYDnlt/txbcfHORY1OKF1fOsIxg4uGLfA==; li_at=AQEDATSV75kBW9tsAAABj8Ke1hcAAAGP5qtaF04A0waFVNvyzgAg-5_PbciGa0WQbVMCgXJYFgm3C_uLgHIJ0jFlP5uGglKGISraZoVAYMaAf2u0Vy7rRuxhC9D69ayBROoM582KjtzBzOota6MTq_6d; liap=true; fptctx2=taBcrIH61PuCVH7eNCyH0K%252fD9DJ44Cptuv0RyrXgXCuWz2IrJLUlFvtd8ZQvmbXVlihuDNIM5LLj93hGvHkKsecOLDVrKz4gSfwWuXRxzfkifEkywhIknAxVJusLbLuPH2Ek6HVjbWRyG6rJb3P3Qzv%252bJ9nNZ83A%252f8ZsFknG6cJ%252bD%252fGVe4W595AVQT6zK3nS95EK8tAZ2MuHUJzHM5dxxl1os4UK0Yo19XXllCUcKuxEAyDW3rj3Tgyu44%252fr27DyoQP23a2A35aifYLpcBqWHujATbGh93zSTGdMuBLUPq0t%252bcHlIaUD3yOoPXpbByt%252bX9E6HiAFO%252fjl2aWaHJ6cTwbl772oJjwtkg7xvFCKVVw%253d; UserMatchHistory=AQKQdEf9FA9RAAAAAY_C1BDsAQTtZbmSZW5W311tjzhFvfVb6StlXqDoZzdRgQEqm4FUE8Emc4xb-xv5s0AbvCCuixxXf1WBUK8MXT_Qh8PvZtlMcO95ZL9tKURxPmsL14L8NE5cTguDl8_elQlGELiydE6BYlWDVSaKNW1G03gV_DSyZF9r9SzUmLnI9_bNmUZD_PdafRoDnjGBjcViegOMO6_eP151zuVBkSA_qLaRD4I7zKBvOYZjAc18cubQtuPxwlXp5Q8rRF6akJk1HWOrZFb3TJNQzJ5KWsPRCsXYLSzhD5ujADc0zYNAIuM2GJWJKjgpa2gWAqKFLLPX2I8SKkMTlqVH16JB2wsGiBPI3e_AHQ; lidc=\"b=OB33:s=O:r=O:a=O:p=O:g=4264:u=1098:x=1:i=1716960630:t=1717039283:v=2:sig=AQEIGP6Kkv0aHf2xS0V6fHq0y1bJEFuP\"",
		"Referer": `https://www.linkedin.com/in/${linkedin_id}/`,
		"Referrer-Policy": "strict-origin-when-cross-origin"
	},
	"body": null,
	"method": "GET"
}).then(async (response) => {
	if (!response.ok) {
		throw new Error('Network response was not ok ' + response.statusText);
	}
	let res = await response.json();
	console.log(res);
	let included = res.included;
	let data = [];

	for (let index = 0; index < included.length; index++) {
		const element = included[index];

		let linkedin_data = {};

		if (included[index].publicIdentifier) {
			linkedin_data.linkedin_id = included[index].publicIdentifier;
		}

		if (included[index].firstName) {
			linkedin_data.first_name = included[index].firstName;
		}

		if (included[index].lastName) {
			linkedin_data.last_name = included[index].lastName;
		}

		if (included[index].headline) {
			linkedin_data.headline = included[index].headline;
		}
		if (included[index].emailAddress) {
			linkedin_data.email = (typeof (included[index].emailAddress) === 'object') ? included[index].emailAddress.emailAddress : included[index].emailAddress;
		}

		if (included[index].phoneNumbers) {
			linkedin_data.mobile_number = Array.isArray(included[index].phoneNumbers) ? included[index].phoneNumbers.join('|') : included[index].phoneNumbers;
		}

		if (included[index].address) {
			linkedin_data.address = included[index].address;
		}

		if (included[index].twitterHandles) {
			linkedin_data.twitter = Array.isArray(included[index].twitterHandles) ? included[index].twitterHandles.join('|') : included[index].twitterHandles;
		}

		if (included[index].websites) {
			linkedin_data.websites = Array.isArray(included[index].websites) ? included[index].websites.join('|') : included[index].websites;
		}

		if (Object.keys(linkedin_data).length != 0) {
			data.push(linkedin_data);
		}
	}

	console.log(data);

	const file_name = "linkedin_lead.csv";
	const fileExists = fs.existsSync(file_name);
	const csvWriter = createCsvWriter({
		path: file_name,
		header: [
			{ id: 'linkedin_id', title: 'LinkedIn ID' },
			{ id: 'first_name', title: 'First Name' },
			{ id: 'last_name', title: 'Last Name' },
			{ id: 'headline', title: 'Headline' },
			{ id: 'email', title: 'Email' },
			{ id: 'mobile_number', title: 'Contact' },
			{ id: 'address', title: 'Address' },
			{ id: 'twitter', title: 'Twitter' },
			{ id: 'websites', title: 'Websites' },
		],
		append: fileExists
	});

	csvWriter.writeRecords(data)
		.then(() => {
			console.log('Data saved successfully.');
		})
		.catch((err) => {
			console.error('Error writing CSV file:', err);
		});
});