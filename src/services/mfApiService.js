const axios = require("axios");

const MFAPI_BASE_URL = "https://api.mfapi.in";

const searchFundsFromAPI = async (query) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/search`,
        {
            params: {
                q: query
            }
        }
    );

    return response.data;
};

const getSchemeFromAPI = async (schemeCode) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/${schemeCode}`
    );

    return response.data;
};

const getLatestNavFromAPI = async (schemeCode) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/${schemeCode}/latest`
    );

    return response.data;
};

const getNavHistoryFromAPI = async (schemeCode, startDate, endDate) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/${schemeCode}`,
        {
            params: {
                startDate,
                endDate
            }
        }
    );

    return response.data;
};

module.exports = {
    searchFundsFromAPI,
    getSchemeFromAPI,
    getLatestNavFromAPI,
    getNavHistoryFromAPI
};