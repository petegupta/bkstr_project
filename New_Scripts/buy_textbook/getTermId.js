import fetch from "node-fetch";
import cheerio from "cheerio";

export const fetchData = async (storeName) => {
    try {
        const res = await fetch(`https://${storeName}.com/buy_textbooks.asp?`);
        const data = await res.text();
        const $ = cheerio.load(data);

        const options = $('select#fTerm option')
        .map((i, elem) => {
            if (i === 0) return; // Skip the first option
            const value = $(elem).val();
            const label = $(elem).text();
            const [campusId, termId] = value.split('|');
            const [campusName, termName] = label.split(' - ');

            return { campusId, termId, campusName, termName };
        })
        .get();
        return options;
// console.log(options);
    } catch (error) {
        console.log(error);
    }
}

