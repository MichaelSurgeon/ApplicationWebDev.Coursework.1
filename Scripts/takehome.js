//  The code below handles all the logic for the takehome calculator page.

// Local Storage Keys
const historyLocalStorageKey = "calculation-history";
const historyIdLocalStorageKey = "currHistoryId"

//reused vars
let history = [];
const historyMax = 10;
const weeksPerMonth = 52 / 12;
const numberOfWeeks = (365 / 7);

//two decimal place format options for text.
const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

// handle page load
function onLoad() {
    localStorage.setItem(historyIdLocalStorageKey, 0);

    //load history from storage.
    let historyFromLocalStorage = JSON.parse(localStorage.getItem(historyLocalStorageKey));

    if(Array.isArray(historyFromLocalStorage))
    {
        // display previous results
        history = historyFromLocalStorage;
        displayCardsBasedOnHistoryLength(history);
    }
}

// Handles submission of calculation form
function handleFormSumbit(event) {
    event.preventDefault();

    //perform the calculation & display cards
    performCalculation();
    displayCardsBasedOnHistoryLength(history);
}

function displayCardsBasedOnHistoryLength(history) {
    // display clear history button and recent result if only one result
    if(history.length == 1) {
        document.getElementById("history-container").style.display = "flex";
        displayRecentResult(history[history.length - 1])
        localStorage.setItem(historyIdLocalStorageKey, history.length - 1);
    }

        // display clear history button, recent result & history card if more than one result
    if(history.length > 1) {
        document.getElementById("history-container").style.display = "flex";
        displayRecentResult(history[history.length - 1])
        displayHistory(history[history.length - 2]);
        localStorage.setItem(historyIdLocalStorageKey, history.length - 2);
        disableArrows(parseInt(localStorage.getItem(historyIdLocalStorageKey)));
    }
}

// performs approprate calculation based on user input
function performCalculation() {
    let storedHistory = localStorage.getItem(historyLocalStorageKey);

    // remove the oldest history object if the history has a length greater than 10.
    let obj = JSON.parse(storedHistory);
    if(Array.isArray(obj) && obj.length >= historyMax ) {
        history.shift();
    }

    // get input values
    let jobTitle = document.getElementById("jobTitle").value;
    let grossPay = parseFloat(document.getElementById("grossPay").value);
    let timeFrame = document.getElementById("timeframe").value;
    let hoursPerWeek = parseFloat(document.getElementById("hoursPerWeek").value);
    let taxRate = parseFloat(document.getElementById("taxRate").value);
    let niRate = parseFloat(document.getElementById("niRate").value);

    const input = {
        jobTitle: jobTitle,
        grossPay: grossPay,
        timeFrame: timeFrame,
        hoursPerWeek: hoursPerWeek,
        taxRate: taxRate,
        niRate: niRate,
        taxDeduction: grossPay * (taxRate / 100),
        niDeduction: grossPay * (niRate / 100)
    };

    let calculatedValues = {};

    // based on the timeframe selected set calculated values to the appropriate value.
    switch(timeFrame){
        case("monthly"):
            calculatedValues = calculateTakeHomeFromMonthly(input);
            break;
        case("yearly"):
            calculatedValues = calculateTakeHomeFromYearly(input);
            break;
        case("weekly"):
            calculatedValues = calculateTakeHomeFromWeekly(input);
            break;
        case("hourly"):
            calculatedValues = calculateTakeHomeFromHourly(input);
            break;
    }

    // add the calculation to the global history (state)
    history.push(calculatedValues);

    // add the newest calculation into local storage.
    localStorage.setItem(historyLocalStorageKey, JSON.stringify(history))
}

// calculates take home pay from a monthly time frame & returns appropriate values.
function calculateTakeHomeFromMonthly(input) {
    const monthlyTakeHome = (input.grossPay - input.taxDeduction - input.niDeduction);
    const weekly = monthlyTakeHome / weeksPerMonth;
    const yearlyTakeHome = (monthlyTakeHome * 12);
    const hourly = monthlyTakeHome / (input.hoursPerWeek * weeksPerMonth);

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay.toLocaleString(undefined, formatOptions),
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "month"
    );
}

// calculates take home pay from a yearly time frame & returns appropriate values.
function calculateTakeHomeFromYearly(input) {
    const yearlyTakeHome = input.grossPay - input.taxDeduction - input.niDeduction;
    const monthlyTakeHome = yearlyTakeHome / 12;
    const weekly = yearlyTakeHome / numberOfWeeks;
    const hourly = yearlyTakeHome / (input.hoursPerWeek * numberOfWeeks);

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay.toLocaleString(undefined, formatOptions),
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "year"
    );
}

// calculates take home pay from a weekly time frame & returns appropriate values.
function calculateTakeHomeFromWeekly(input) {
    const weekly = input.grossPay - input.taxDeduction - input.niDeduction;
    const yearlyTakeHome = weekly * numberOfWeeks;
    const monthlyTakeHome = yearlyTakeHome / 12;
    const hourly = yearlyTakeHome / (input.hoursPerWeek * numberOfWeeks);

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay.toLocaleString(undefined, formatOptions),
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "week"
    );
}

// calculates take home pay from a hourly time frame & returns appropriate values.
function calculateTakeHomeFromHourly(input) {
    const hourly = input.grossPay - input.taxDeduction - input.niDeduction;
    const weekly = hourly * input.hoursPerWeek;
    const monthlyTakeHome = weekly * weeksPerMonth;
    const yearlyTakeHome = monthlyTakeHome * 12;

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay.toLocaleString(undefined, formatOptions),
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "hour"
    );
}

// display recentResult based on the inputed history.
function displayRecentResult(history) {
    document.querySelector('#calculator-results .section-card:nth-last-child(2)').style.display = "flex";

    document.getElementById("recent-result-job-title").innerHTML = history.jobTitle;
    document.getElementById("recent-result-text").innerHTML =
    `Working ${history.countOfHours} hours a week for a gross pay of £${history.grossPay} per ${history.timeFrame} with ${history.taxRate}% Tax and ${history.niRate}% NI results in a take-home pay of`;
    document.getElementById("recent-result-yearly").innerHTML = history.yearly;
    document.getElementById("recent-result-monthly").innerHTML = history.monthly;
    document.getElementById("recent-result-weekly").innerHTML = history.weekly;
    document.getElementById("recent-result-hourly").innerHTML = history.hourly;
}

// display history based on the inputed history.
function displayHistory(history) {

    document.querySelector('#calculator-results .section-card:nth-last-child(1)').style.display = "flex";

    document.getElementById("history-job-title").innerHTML = history.jobTitle;
    document.getElementById("history-text").innerHTML =
    `Working ${history.countOfHours} hours a week for a gross pay of £${history.grossPay} per ${history.timeFrame} with ${history.taxRate}% Tax and ${history.niRate}% NI results in a take-home pay of`;
    document.getElementById("history-yearly").innerHTML = history.yearly;
    document.getElementById("history-monthly").innerHTML = history.monthly;
    document.getElementById("history-weekly").innerHTML = history.weekly;
    document.getElementById("history-hourly").innerHTML = history.hourly;
}

// handles when a user presses the left (back) arrow in history
function moveHistoryLeft() {
    let currHistoryId = parseInt(localStorage.getItem(historyIdLocalStorageKey));
    if(currHistoryId <= 0) {
        return;
    }

    currHistoryId--;

    disableArrows(currHistoryId)

    localStorage.setItem(historyIdLocalStorageKey, currHistoryId);
    let historyToDisplay = history[currHistoryId];
    displayHistory(historyToDisplay);
}

// handles when a user presses the right (next) arrow in history
function moveHistoryRight() {
    let currHistoryId = parseInt(localStorage.getItem(historyIdLocalStorageKey));
    currHistoryId++;

    disableArrows(currHistoryId)

    localStorage.setItem(historyIdLocalStorageKey, currHistoryId);
    let historyToDisplay = history[currHistoryId];
    displayHistory(historyToDisplay);
}

// handles which arrows should be displed or not depeding on what page.
function disableArrows(currHistoryId) {
    if(currHistoryId >= 1) {
        handleHistoryArrows("left", "visible");
    } else {
        handleHistoryArrows("left", "hidden");
    }

    if(currHistoryId == history.length - 1) {
        handleHistoryArrows("right", "hidden");
    } else {
        handleHistoryArrows("right", "visible");
    }
}

// hide history arrows based on input
function handleHistoryArrows(arrow, style) {
    switch(arrow) {
        case ("left"):
            document.getElementById("history-left-arrow").style.visibility = style;
            break;
        case ("right"):
            document.getElementById("history-right-arrow").style.visibility = style;
            break;
        case ("both"):
            document.getElementById("history-right-arrow").style.visibility = style;
            document.getElementById("history-left-arrow").style.visibility = style;
            break;
        default:
            return;
    }
}

class Calculation {
    constructor(yearly, monthly, weekly, hourly, jobTitle, grossPay, hours, taxRate, niRate, timeFrame) {
        this.yearly = yearly;
        this.monthly = monthly;
        this.weekly = weekly;
        this.hourly = hourly;
        this.jobTitle = jobTitle;
        this.grossPay = grossPay;
        this.countOfHours = hours;
        this.taxRate = taxRate;
        this.niRate = niRate;
        this.timeFrame = timeFrame;
    }
}

// setup event listeners. 
document.getElementById("takehome-clear-history").addEventListener('click', (event) => {
    localStorage.removeItem(historyLocalStorageKey);
    location.reload();
})

document.getElementById("calculator-input-form").addEventListener('submit', handleFormSumbit);
document.getElementById("history-right-arrow").addEventListener('click', moveHistoryRight);
document.getElementById("history-left-arrow").addEventListener('click', moveHistoryLeft);
window.addEventListener("load", onLoad);