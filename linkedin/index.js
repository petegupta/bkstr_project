const axios = require('axios');

async function getFinalUrl(initialUrl) {
    try {
        const response = await axios.head(initialUrl, {
            maxRedirects: 0, // Disable automatic redirects to get the headers
        });

        // Extract the final URL from the 'location' header
        const finalUrl = response.headers['location'];

        if (finalUrl) {
            return finalUrl;
        } else {
            // If there is no 'location' header, the initial URL is the final URL
            return initialUrl;
        }
    } catch (error) {
        // Handle errors, e.g., request failed, network issues
        console.error('Error:', error.message);
        throw error;
    }
}