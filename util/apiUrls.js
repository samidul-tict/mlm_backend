const config = require('config');
const apiConst = 'https://financialmodelingprep.com/api/v3';

// Market Hour Url
exports.marketHourUrl = `${apiConst}/market-hours?apikey=${config.get("apiKey")}`;

//Get Stock Profile Url
exports.getProfileUrl = (symbols) => {
    return `${apiConst}/profile/${symbols}?apikey=${config.get("apiKey")}`;
}

// Get Stocks Quote RealTime (for point calculation);
exports.getStocksQuote = (symbols) => {
    return `${apiConst}/quote/${symbols}?apikey=${config.get("apiKey")}`;
}

//Get Stock News Url
exports.getNewsUrl = (symbol) => {
    return `${apiConst}/stock_news?tickers=${symbol}&limit=50&apikey=${config.get("apiKey")}`;
}

// Create Razorpay Contact
exports.razorpayContact = "https://api.razorpay.com/v1/contacts";

// Create Razorpay Contact Fund Account
exports.razorpayFundAccount = "https://api.razorpay.com/v1/fund_accounts";

//Payout
exports.razorpayPayout = "https://api.razorpay.com/v1/payouts/";