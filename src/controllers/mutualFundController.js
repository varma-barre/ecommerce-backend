const MutualFund = require("../models/MutualFund");

const {
    searchFundsFromAPI,
    getSchemeFromAPI,
    getLatestNavFromAPI,
    getNavHistoryFromAPI
} = require("../services/mfApiService");


// 1. Search mutual funds
const searchFunds = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                message: "Search keyword is required"
            });
        }

        const data = await searchFundsFromAPI(q);

        return res.status(200).json(data);

    } catch (error) {
        console.error("MFAPI Search Error:", error.message);

        return res.status(502).json({
            message: "Unable to fetch mutual fund search results from MFAPI"
        });
    }
};


// 2. Get scheme details and store in MongoDB
const getScheme = async (req, res) => {
    try {
        const { schemeCode } = req.params;

        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            return res.status(400).json({
                message: "Valid scheme code is required"
            });
        }

        const data = await getSchemeFromAPI(schemeCode);

        if (!data || !data.meta) {
            return res.status(404).json({
                message: "Mutual fund scheme not found"
            });
        }

        const meta = data.meta;

        const mutualFund = await MutualFund.findOneAndUpdate(
            {
                schemeCode: String(meta.scheme_code)
            },
            {
                schemeCode: String(meta.scheme_code),
                schemeName: meta.scheme_name,
                fundHouse: meta.fund_house,
                schemeType: meta.scheme_type,
                schemeCategory: meta.scheme_category,
                isinGrowth: meta.isin_growth,
                isinDivReinvestment: meta.isin_div_reinvestment
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Mutual fund details fetched and stored successfully",
            data: mutualFund
        });

    } catch (error) {
        console.error("Get Scheme Error:", error.message);

        return res.status(502).json({
            message: "Unable to fetch mutual fund details from MFAPI"
        });
    }
};


// 3. Get latest NAV and store it
const getLatestNav = async (req, res) => {
    try {
        const { schemeCode } = req.params;

        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            return res.status(400).json({
                message: "Valid scheme code is required"
            });
        }

        const data = await getLatestNavFromAPI(schemeCode);

        if (!data || !data.data || data.data.length === 0) {
            return res.status(404).json({
                message: "Latest NAV not found"
            });
        }

        const latestData = data.data[0];

        const mutualFund = await MutualFund.findOneAndUpdate(
            {
                schemeCode: String(schemeCode)
            },
            {
                latestNav: Number(latestData.nav),
                latestNavDate: latestData.date
            },
            {
                new: true,
                upsert: false
            }
        );

        if (!mutualFund) {
            return res.status(404).json({
                message: "Scheme not found in database. Fetch scheme details first."
            });
        }

        return res.status(200).json({
            message: "Latest NAV fetched and stored successfully",
            data: data
        });

    } catch (error) {
        console.error("Latest NAV Error:", error.message);

        return res.status(502).json({
            message: "Unable to fetch latest NAV from MFAPI"
        });
    }
};


// 4. Get NAV history
const getNavHistory = async (req, res) => {
    try {
        const { schemeCode } = req.params;
        const { startDate, endDate } = req.query;

        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            return res.status(400).json({
                message: "Valid scheme code is required"
            });
        }

        const data = await getNavHistoryFromAPI(
            schemeCode,
            startDate,
            endDate
        );

        return res.status(200).json(data);

    } catch (error) {
        console.error("NAV History Error:", error.message);

        return res.status(502).json({
            message: "Unable to fetch NAV history from MFAPI"
        });
    }
};


// 5. Get stored mutual funds
const getStoredMutualFunds = async (req, res) => {
    try {
        const mutualFunds = await MutualFund.find()
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            count: mutualFunds.length,
            data: mutualFunds
        });

    } catch (error) {
        console.error("Database Error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch mutual funds from database"
        });
    }
};


module.exports = {
    searchFunds,
    getScheme,
    getLatestNav,
    getNavHistory,
    getStoredMutualFunds
};