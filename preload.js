// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })
const rbt = require('./rbt-futures.js');

    
// like a listener or something ...
function subscribeToSymbol() {
    // ...
    let symbol = (document.getElementById('symbol_code').value || symbol.getAttribute('placeholder') || '').toLocaleUpperCase();
    let costs = document.getElementById('to_buy_sell_costs');
    
    // check errors
    if (!symbol) {
        console.error('ERROR: SYMBOL name is empty!');
        return;
    }

    // set callback
    let showSomeBuyingSellingCosts = function (calculatedStuff) {
        costs.innerHTML = `
        for the current PRICE: ${calculatedStuff.currentBidPrice}<br>
        COMMISSION to pay BUYING: ${calculatedStuff.commissionInUSDTforBuying}<br>
        COMMISSION to pay SELLING: ${calculatedStuff.commissionInUSDTforSelling}<br>
        how much COINS can BUY: ${calculatedStuff.quantityToBuy}<br>
        how much COINS can SELL: ${calculatedStuff.quantityToSell}<br>
        how much USDT should pay       for that amounts of COINS when BUYing: ${calculatedStuff.buyOrderQuntityInUSDT}<br>
        how much USDT can    gain/earn for that amounts of COINS when SELLing: ${calculatedStuff.sellOrderQuntityInUSDT}<br>
        `
    }
    
    // set callback
    let afterGettingSymbolPrice = function (futuresPriceResponce) {
        let symbolPrice = document.getElementById('symbol_price');
        let amountUSDT = document.getElementById('amount_in_usdt_to_spend');
        let currentPrice = futuresPriceResponce.price;

        amountUSDT = amountUSDT.value || amountUSDT.getAttribute('placeholder');

        symbolPrice.innerText = currentPrice;

        // calculate/estimate ...
        // rbt.tellMeHowMuchCoinsCanBuyForThisAmountOfUSDTNow(0, futuresPriceResponce.price, showSomeBuyingSellingCosts);

        let calculatedStuff = rbt.calculate(currentPrice, currentPrice, 0, amountUSDT);

        showSomeBuyingSellingCosts(calculatedStuff);
    }

    // run the ticker
    rbt.subscribeToSymbolPrice(symbol, afterGettingSymbolPrice);
}

// when the DOM of the Page is ready to ROLL
window.addEventListener('DOMContentLoaded', () => {
    // trigger for button - test
    document.getElementById('buylong').addEventListener('click', (e) => {
        // console.log('hi')
        let n = test(5);
        let { prices, orderResponce } = rbt.buyFutures(futuresPriceResponce, buyRequestResponse)

        document.getElementById('electron-version').innerText = ' -- HI ! -- ' + n;
        document.getElementById('electron-version').innerText = ' -- HI ! -- ' + n;
    });


    // trigger for button - WATCH_SYMBOL
    document.getElementById('watch_symbol').addEventListener('click', (e) => {
        subscribeToSymbol();
    });

    // trigger for button - un WATCH_SYMBOL
    document.getElementById('unwatch_symbol').addEventListener('click', (e) => {
        // let symbol = (document.getElementById('symbol_code').nodeValue | '').toLocaleUpperCase();

        // run the ticker
        rbt.unSubscribeToSymbolPrice();
    });

    // trigger for button - un WATCH_SYMBOL
    document.getElementById('symbol_code').addEventListener('keyup', (event) => {
        // only when the Majesty 'Enter' key is pressed
        if (event.key === "Enter") { // same sh.. as keyCode == 13
            // Cancel the default action, if needed
            event.preventDefault();
            
            // unsubscribe even if there is not any
            rbt.unSubscribeToSymbolPrice();
            // and subscribe to what was typed at SYMBOL text area
            subscribeToSymbol();
        }
    });
    
});
