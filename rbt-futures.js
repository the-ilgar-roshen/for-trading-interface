// const { OrderImmediatelyFillable } = require('ccxt');
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: 'JFNPLBZiuYcBpBeSWPndtJHJmudpmdCp39Lt5PtgOieuyC1voNMmf1x2YqofAAS5',
    APISECRET: 'QjOD4O7ViGnutn1atBKQo5hIrNttYioLZEcp7rkWpNYcfOwbwi5vWb7h5FUPfmuQ'
});
const request = require( 'request' );

// DEBUG to turn ON/OFF
const DEBUG = true; // just to print on the console some info

// CONSTANTS FOR INTERNAL USE FOR CLIENT/SERVER FUNCTIONS
const ORDER = {
    BUY:  1,
    SELL: 2,
};
const ORDER_STATUS = {
    HANGING_LIKE_A_DICK:      'NEW',
    BOUGHT_OR_SOLD_YOUR_SHIT: 'FILL'
};



// == ALGIRITHM related CONSTANTS ==============================================
// *****************************************************************************

// defaults for running tarding
const SYMBOL     = "BNBUSDT";         // can be any COIN; e.g. ETHUSDT 
const COMMISSION = parseFloat(0.001); // commission that takes the trading ... ; the 0.001 = 0.1 %

const USDT_ORIENTED                         = true;            // means, USDT to spend is fixed
const DEFAULT_AMOUNT_USDT_SPEND_WHEN_BUYING = parseFloat(11);  // HOW MUCH CRYPTO USDT TO PAY/SPEND TO BUY COINS
const DEFAULT_AMOUNT_OF_COINS_TO_BUYSELL    = parseFloat(36);  // HOW MUCH CRYPTO COINS TO BUY/SELL

const DEFAULT_FREQUENCY_OF_PRICE_TICK = 5; // times in one second


// == BASIC FUNCTIONS for CALCULATING, ESTIMATING etc. =========================
// *****************************************************************************

// calculate how much for what amount of coins needs to spend etc.
function calculate(bidPrice, askPrice, buyingQuantityCoins, buyingForAmountInUSDT) {
    // PARAMETERS - assign basic CONSTANTS to basic VARIABLES
    let USDT_oriented          = USDT_ORIENTED;                         // if nothing will be set
    let amountSpendWhenBuying  = DEFAULT_AMOUNT_USDT_SPEND_WHEN_BUYING;
    let amountOfCoinsToBUYSELL = DEFAULT_AMOUNT_OF_COINS_TO_BUYSELL;
    // PARAMETERS - set VALUES to basic VARIABLES
    if (buyingForAmountInUSDT > 0) {
        amountSpendWhenBuying = parseFloat(buyingForAmountInUSDT);
        USDT_oriented = true;
    }
    else if (buyingQuantityCoins > 0) {
        amountOfCoinsToBUYSELL = parseFloat(buyingQuantityCoins);
        USDT_oriented = false;
    }
    else {
        // IF NEITHER OF THOSE THEN DEFAULTS WILL TELL THE VALUES
    }

    // ERROR HANDLING before shit happens
    if (typeof bidPrice != 'number' && typeof bidPrice != 'string' || typeof askPrice != 'number' && typeof askPrice != 'string') {
        console.log('ERROR: MSG: GO ... !');
        return;
    }
    
    // GET THE LENGTH/SIZE of DECIMALS [tailing after floating point]
    const PRECISSION = parseInt((bidPrice + ".").split(".")[1].length); // 'PRICE TAIL' ZEROS AFTER 0.00.. [NOTE: this line/solution for getting decimals is from stakoverflow]
    
    // GET CURRENT DATA about state (price)
    const currentBidPrice = parseFloat(bidPrice).toFixed(PRECISSION); // price or value of COIN in USDT
    const currentAskPrice = parseFloat(askPrice).toFixed(PRECISSION); // price or value of COIN in USDT

    //// == TAX CALCULATING Section ============================================
    // COMMISSION stuff
    let quantityToBuy         = parseFloat(amountSpendWhenBuying  / currentBidPrice).toFixed(PRECISSION);  // how much COINS can buy for A certain amounts of USDT
    let quantityToSell        = parseFloat(amountOfCoinsToBUYSELL / currentAskPrice).toFixed(PRECISSION);  // how much COINS can buy for A certain amounts of USDT
    let commissionForBuying   = parseFloat(amountSpendWhenBuying  * COMMISSION).toFixed(PRECISSION);       // how much to pay commission when buying
    let commissionForSelling  = parseFloat(amountOfCoinsToBUYSELL * COMMISSION).toFixed(PRECISSION);       // how much to pay commission when buying
    
    // WHEN the amount of USDT is FIXED [for use/entrance]
    //  lets calculate; to buy n1 COINS for n2 amount of USDT 
    //  how much of those COINS one can buy for that amount of USDT ?
    //  and in the future, how much these new bought COINS will cost 
    //  
    //  so,  the amount of USDT        is FIXED
    //  but, the amount of COINS needs to DETERMINE
    //  
    //  thus,
    //  let amountCoinsToBuySell = DEFAULT_AMOUNT_USDT_SPEND_WHEN_BUYING / currentBidPrice;
    //  
    //  let quantityToBuy        = DEFAULT_AMOUNT_USDT_SPEND_WHEN_BUYING / currentBidPrice; // quantityToBuy === DEFAULT_AMOUNT_OF_COINS_TO_BUYSELL 
    //  let quantityToSell       = quantityToBuy;
    //  let commissionForBuying  = DEFAULT_AMOUNT_USDT_SPEND_WHEN_BUYING * COMMISSION;
    //  let commissionForSelling = quantityToSell                        * COMMISSION;
    // 
    if (USDT_oriented) {
        amountCoinsToBuySell = parseFloat(amountSpendWhenBuying / currentBidPrice).toFixed(PRECISSION);
        
        quantityToBuy        = parseFloat(amountSpendWhenBuying / currentBidPrice).toFixed(PRECISSION); // quantityToBuy === DEFAULT_AMOUNT_OF_COINS_TO_BUYSELL 
        quantityToSell       = quantityToBuy;
        commissionForBuying  = parseFloat(amountSpendWhenBuying * COMMISSION).toFixed(PRECISSION);
        commissionForSelling = parseFloat(quantityToSell        * COMMISSION); //.toFixed(PRECISSION); // WARNING: can cause issues
    }

    // WHEN the amount of COINS is FIXED [for use/entrance]
    //  lets calculate; to buy n1 COINS for n2 amount of USDT 
    //  how much of USDT should spend to buy that amounts of COINS ?
    //  and in the future, how much these new bought COINS will cost 
    //  
    //  so,  the amount of COINS       is FIXED
    //  but, the amount of USDT  needs to DETERMINE
    // 
    else {
        amountUSDTSpendWhenBuying = parseFloat(amountOfCoinsToBUYSELL * currentBidPrice).toFixed(PRECISSION);
        // so 'DEFAULT_AMOUNT_USDT_SPEND_WHEN_BUYING' == amountUSDTSpendWhenBuying [now]
        
        quantityToBuy        = amountOfCoinsToBUYSELL;
        quantityToSell       = amountOfCoinsToBUYSELL;
        commissionForBuying  = parseFloat(amountUSDTSpendWhenBuying * COMMISSION).toFixed(PRECISSION);
        commissionForSelling = parseFloat(quantityToSell            * COMMISSION); //.toFixed(PRECISSION); // WARNING: can cause issues
    }

    // conversion from coins into USDT
    let commissionInUSDTforBuying   = parseFloat(commissionForBuying                   ).toFixed(PRECISSION); // REDUNDANT
    let commissionInUSDTforSelling  = parseFloat(commissionForSelling * currentBidPrice).toFixed(PRECISSION); // additional calculation for convenience
    let buyOrderQuntityInUSDT       = parseFloat(quantityToBuy        * currentBidPrice).toFixed(PRECISSION); // howMuchSpendsForBuying
    let sellOrderQuntityInUSDT      = parseFloat(quantityToSell       * currentAskPrice).toFixed(PRECISSION); // howMuchReturnsFromSelling
    
    // return all calculated ...
    // NOTE: IT MAY LOWER or INCREASE THE INITIAL USDT AMOUNT TO BE SPEND WHEN BOUGHT QUANTITY IS TOO LOW
    return {
        PRECISSION,
        currentBidPrice,            // for the current PRICE
        commissionInUSDTforBuying,  // COMMISSION to pay BUYING
        commissionInUSDTforSelling, // COMMISSION to pay SELLING
        quantityToBuy,              // how much COINS can BUY
        quantityToSell,             // how much COINS can SELL
        buyOrderQuntityInUSDT,      // how much USDT should pay       for that amounts of COINS when BUYing
        sellOrderQuntityInUSDT,     // how much USDT can    gain/earn for that amounts of COINS when SELLing
    };
}


// == API - FUTURES ============================================================
// *****************************************************************************

// BUY/LONG FUTURES
function buyFutures(price, takeProfit, userCallback) {
    // temporarily ...
    let quantity = 1;
    let symbol = "DOGEUSDT";

    // request for BUY/LONG
    async function requestBuylongOrder(price, takeProfit) {
        let response = await binance.futuresBuy( symbol, quantity, price, {
            reduceOnly: true
        } )

        return response;
    }

    // APPLY
    let requestHandler = (error, responce, futuresPriceResponce) => {
        // IMPLEMENT
        // requestBuylongOrder(price, takeProfit).then((buyRequestResponse) => {
        //     // IMPLEMENT
        //     typeof userCallback == 'function' && userCallback(futuresPriceResponce, buyRequestResponse)
        // })
        typeof userCallback == 'function' && userCallback(futuresPriceResponce, responce)
    }

    // send request to get the CURRENT PRICE
    getFuturesPrice(symbol, requestHandler)

    return;
}
// GET THE CURRENT PRICE FOR THE SYMBOL
function getFuturesPrice(symbol, requestHandler) {
    let url = 'https://fapi.binance.com/fapi/v1/ticker/price?symbol=' + symbol;

    let options = {
        url: url
    };

    // @params error, responce, body
    requestHandler = typeof requestHandler == 'function' ? requestHandler : function () {}
    
    let requestHandlerWrapper = (error, responce, body) => {
        // handle errors

        // such MORONS!
        if (typeof body == 'string') {
            // console.log('HOLLY SHIT! IS THIS A STRING ? ... !');

            body = JSON.parse(body);
        }

        // call user function
        requestHandler(body);
    }

    request( options, requestHandlerWrapper );
}

// == API - SPOT ===============================================================
// *****************************************************************************

// LIMIT BUY order with callback
function buyCoins(symbol, quantity, price, afterBuyOrder, errorFallback) {
    // let quantity = 100, price = 0.40;
    // DEBUG && console.log('INTRO FUNCTION [1]: buyCoins'); // DEBUG - will show that the function has been run 

    // send the BUY request
    binance.buy(symbol, quantity, price, { type:'LIMIT' }, (error, response) => {
        // CHECK FOR ERRORS
        if (error != null) {
            console.log('ERROR: binance.buy -> ', error.body);
            console.log('STOP NONE BOUGHT: binance.buy | STRATEGY & TRADE APPLIED & NO DATA SAVED !');
            
            errorFallback && errorFallback();

            return false;
        }
        
        // when bought
        // bought(response, afterBuyOrder);
        checkOrderStatus(ORDER.BUY, response, afterBuyOrder, errorFallback);
    });
}
// CHECK NEW/FILLED ORDER STATUS
function checkOrderStatus(orderSide, buySellResponse, afterBuyOrSellOrder, errorFallback) {
    // DEBUG - will show that the function has been run
    DEBUG && console.log('INTRO FUNCTION [3]: checkOrderStatus');

    // check for errors
    if (!(buySellResponse && buySellResponse.orderId)) {
        console.log('ERROR: buySellResponse IS EMPTY ! ');
        console.log('MESSAGE: NO ORDER_ID HAS BEEN RETURNED!');

        errorFallback && errorFallback();

        return false;
    }

    // buySellResponse = { 'orderId', 'price', quantity: 'origQty' }
    let orderID = buySellResponse.orderId;
    let price = buySellResponse.price;
    let quantity = buySellResponse.origQty;

    // wait then run function that gets order status
    setTimeout(() => {
        // get the status for the ORDER
        binance.openOrders( SYMBOL , orderID, (openOrdersError, orderStatusObject, symbol) => {
            // DEBUG - will show that the function has been run
            DEBUG && console.log('INTRO FUNCTION [4]: binance.openOrders');

            // CHECK FOR ERRORS
            if (openOrdersError != null) {
                console.log('ERROR: binance.openOrders');
                console.log('MESSAGE: NO DATA ABOUT ORDER \'' + orderID + '\' THUS NOTHING BOUGHT/SOLD');
                
                errorFallback && errorFallback();

                return false;
            }

            // adjust a few things
            if (!orderStatusObject) {
                orderStatusObject = null;
            }
            let orderStatus = orderStatusObject && orderStatusObject.status ? orderStatusObject.status : '';

            // LOG
            console.log(`
            binance.openOrders:
            side: ${orderSide == ORDER.BUY ? 'BUY' : 'SELL'}
            symbol: ${symbol}
            orderStatus: ${orderStatus}
            `,
            'orderStatus all:', orderStatusObject);
            
            // callback
            // afterBuyOrSellOrder(orderID, price, quantity, orderStatus, orderStatusObject, buySellResponse);
        });
    }, DELAY * 1000); // wait a second

    return;
}


// == TRADE RUNNER =============================================================
// *****************************************************************************
function runner(params) {
    // IMPLEMENT
}


// -- for WEB Interface --------------------------------------------------------
// *****************************************************************************

// the ID for subscribeToSymbolPrice
let tradeRunnerTicker = null;

// WEB interface
function subscribeToSymbolPrice(symbol, userWebCallback, frequency) {
    // check for ~errors
    if (!symbol) {
        console.error('MORON ! put the ..g SYMBOL !');
        return;
    }
    // set some vars
    let interval = parseFloat(1000 / (frequency | DEFAULT_FREQUENCY_OF_PRICE_TICK)).toFixed(0);
    
    // make it to tick after each ...
    tradeRunnerTicker = setInterval(() => {
        
        let afterGettingPrice = function(futuresPriceResponce) {
            // send the data to the WEB interface callback function as an ARGUMENT
            userWebCallback(futuresPriceResponce);
        }

        getFuturesPrice(symbol, afterGettingPrice);

    }, interval);

    // close session - close/stop interval/ticks
    // setTradeDuration(duration);
}
function unSubscribeToSymbolPrice() {
    clearInterval(tradeRunnerTicker);
}


// == TEST =====================================================================
// *****************************************************************************


// buyCoins('BNBUSDT', 0.02, 678, function () {}, function () {})


// test
function test(number) {
    return number * 3;
}

// YOU NEED DESCRIPTION OF THE FUNCTION - READ THE NAME OF THE FUNCTION
function tellMeHowMuchCoinsCanBuyForThisAmountOfUSDTNow(buyingQuantityCoins, buyingForAmountInUSDT, afterGettingPriceAndCOST) {
    // ...
    let afterGettingPrices = (futuresPriceResponce) => {
        if (!futuresPriceResponce) return;

        // just reassign vars for convenience
        let price = futuresPriceResponce["price"];

        // calculate how much for what amount of coins needs to spend etc.
        let calculatedStuff = calculate(price, price, buyingQuantityCoins, buyingForAmountInUSDT);

        // PRINT
        console.log('futuresPriceResponce: ', futuresPriceResponce);

        // return all of that needfull calculatedStuff 
        afterGettingPriceAndCOST(calculatedStuff);
    }

    getFuturesPrice(SYMBOL, afterGettingPrices);
}

// callback function - feedback or so etc.
let afterGettingPriceAndCOST = function (calculatedStuff) {
    // so, decide what to do with all that stuff
    console.log('calculatedStuff:      ', calculatedStuff);
}
// apply function - asking in USDT
tellMeHowMuchCoinsCanBuyForThisAmountOfUSDTNow(0, 11, afterGettingPriceAndCOST); // e.g. how much coins will get for 11 USDT for current price




// == EXPORT important FUNCTIONS ===============================================
// *****************************************************************************

// export functions
module.exports = {
    buyFutures, 
    calculate,
    subscribeToSymbolPrice, unSubscribeToSymbolPrice, 
    tellMeHowMuchCoinsCanBuyForThisAmountOfUSDTNow,
    test
};
