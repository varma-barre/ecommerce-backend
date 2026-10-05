const express = require("express");

const router = express.Router();

const {
    searchFunds,
    getScheme,
    getLatestNav,
    getNavHistory,
    getStoredMutualFunds
} = require("../controllers/mutualFundController");


router.get("/search", searchFunds);

router.get("/:schemeCode/latest", getLatestNav);

router.get("/:schemeCode/nav-history", getNavHistory);

router.get("/:schemeCode", getScheme);

router.get("/", getStoredMutualFunds);


module.exports = router;