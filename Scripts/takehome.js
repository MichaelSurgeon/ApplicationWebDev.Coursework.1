
const historyLocalStorageKey = "calculation-history";
const historyIdLocalStorageKey = "currHistoryId"
const historyMax = 10;
let history = [];

window.addEventListener("load", (event) => {
    localStorage.setItem(historyIdLocalStorageKey, 0);
    let historyFromLocalStorage = JSON.parse(localStorage.getItem(historyLocalStorageKey));
    if(Array.isArray(historyFromLocalStorage))
    {
        history = historyFromLocalStorage;

        if(history.length == 1) {
            displayRecentResult(history[history.length - 1])
            localStorage.setItem(historyIdLocalStorageKey, history.length - 1);
        }

        if(history.length > 1) {
            displayRecentResult(history[history.length - 1])
            displayHistory(history[history.length - 2]);
            localStorage.setItem(historyIdLocalStorageKey, history.length - 2);
            disableArrows(parseInt(localStorage.getItem(historyIdLocalStorageKey)));
        }
    }
});

document.getElementById("history-right-arrow").addEventListener('click', (event) => {
    event.preventDefault();
    moveHistoryRight();
})

document.getElementById("history-left-arrow").addEventListener('click', (event) => {
    event.preventDefault();
    moveHistoryLeft();
})

document.getElementById("calculator-input-form").addEventListener('submit', (event) => {
    event.preventDefault();
    performCalculation();

    if(history.length == 1) {
        displayRecentResult(history[history.length - 1])
        localStorage.setItem(historyIdLocalStorageKey, history.length - 1);
    }

    if(history.length > 1) {
        displayRecentResult(history[history.length - 1])
        displayHistory(history[history.length - 2]);
        localStorage.setItem(historyIdLocalStorageKey, history.length - 2);
        disableArrows(parseInt(localStorage.getItem(historyIdLocalStorageKey)));
    }
})

function performCalculation() {
    let currStorage = localStorage.getItem(historyLocalStorageKey);

    let obj = JSON.parse(currStorage);
    if(Array.isArray(obj) && obj.length >= historyMax ) {
        history.shift();
    }

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
        niRate: niRate
    };

    let calculatedValues = {};

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

    history.push(calculatedValues);
    localStorage.setItem(historyLocalStorageKey, JSON.stringify(history))
}

function calculateTakeHomeFromMonthly(input) {
    const weeksPerMonth = 52 / 12;
    const taxDeduction = input.grossPay * (input.taxRate / 100);
    const niDeduction = input.grossPay * (input.niRate / 100);
    const monthlyTakeHome = (input.grossPay - taxDeduction - niDeduction);
    const weekly = monthlyTakeHome / weeksPerMonth;
    const yearlyTakeHome = (monthlyTakeHome * 12);
    const hourly = monthlyTakeHome / (input.hoursPerWeek * weeksPerMonth);

    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay,
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "month"
    );
}


function calculateTakeHomeFromYearly(input) {
    const taxDeduction = input.grossPay * (input.taxRate / 100);
    const niDeduction = input.grossPay * (input.niRate / 100);

    const numberOfWeeks = (365 / 7);
    const yearlyTakeHome = input.grossPay - taxDeduction - niDeduction;
    const monthlyTakeHome = yearlyTakeHome / 12;
    const weekly = yearlyTakeHome / numberOfWeeks;
    const hourly = yearlyTakeHome / (input.hoursPerWeek * numberOfWeeks);

    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay,
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "year"
    );
}

function calculateTakeHomeFromWeekly(input) {
    const taxDeduction = input.grossPay * (input.taxRate / 100);
    const niDeduction = input.grossPay * (input.niRate / 100);

    const numberOfWeeks = (365 / 7);
    const weekly = input.grossPay - taxDeduction - niDeduction;
    const yearlyTakeHome = weekly * numberOfWeeks;
    const monthlyTakeHome = yearlyTakeHome / 12;
    const hourly = yearlyTakeHome / (input.hoursPerWeek * numberOfWeeks);


    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay,
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "week"
    );
}

function calculateTakeHomeFromHourly(input) {
    const taxDeduction = input.grossPay * (input.taxRate / 100);
    const niDeduction = input.grossPay * (input.niRate / 100);

    const weeksPerMonth = 52 / 12;
    const hourly = input.grossPay - taxDeduction - niDeduction;
    const weekly = hourly * input.hoursPerWeek;
    const monthlyTakeHome = weekly * weeksPerMonth;
    const yearlyTakeHome = monthlyTakeHome * 12;

    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    return new Calculation(
        yearlyTakeHome.toLocaleString(undefined, formatOptions),
        monthlyTakeHome.toLocaleString(undefined, formatOptions),
        weekly.toLocaleString(undefined, formatOptions),
        hourly.toLocaleString(undefined, formatOptions),
        input.jobTitle,
        input.grossPay,
        input.hoursPerWeek,
        input.taxRate,
        input.niRate,
        "hour"
    );
}


function displayRecentResult(obj) {
    document.querySelector('#calculator-results .section-card:nth-last-child(2)').style.display = "flex";

    document.getElementById("recent-result-job-title").innerHTML = obj.jobTitle;
    document.getElementById("recent-result-text").innerHTML =
    `Working ${obj.countOfHours} hours a week for a gross pay of £${obj.grossPay} per ${obj.timeFrame} with ${obj.taxRate}% Tax and ${obj.niRate}% NI results in a take-home pay of`;
    document.getElementById("recent-result-yearly").innerHTML = obj.yearly;
    document.getElementById("recent-result-monthly").innerHTML = obj.monthly;
    document.getElementById("recent-result-weekly").innerHTML = obj.weekly;
    document.getElementById("recent-result-hourly").innerHTML = obj.hourly;
}

function displayHistory(historyToDisplay) {

    document.querySelector('#calculator-results .section-card:nth-last-child(1)').style.display = "flex";

    document.getElementById("history-job-title").innerHTML = historyToDisplay.jobTitle;
    document.getElementById("history-text").innerHTML =
    `Working ${historyToDisplay.countOfHours} hours a week for a gross pay of £${historyToDisplay.grossPay} per ${historyToDisplay.timeFrame} with ${historyToDisplay.taxRate}% Tax and ${historyToDisplay.niRate}% NI results in a take-home pay of`;
    document.getElementById("history-yearly").innerHTML = historyToDisplay.yearly;
    document.getElementById("history-monthly").innerHTML = historyToDisplay.monthly;
    document.getElementById("history-weekly").innerHTML = historyToDisplay.weekly;
    document.getElementById("history-hourly").innerHTML = historyToDisplay.hourly;
}

function displayLastTwoCards(itemToDisplay) {
    if(history.length == 1) {
        hideHistoryArrows("both");
    }

    const lastTwoCards = document.querySelectorAll('#calculator-results .section-card:nth-last-child(-n + 2)');
        lastTwoCards.forEach(card => {
            card.style.display = 'flex';
    });
}

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

function moveHistoryRight() {
    let currHistoryId = parseInt(localStorage.getItem(historyIdLocalStorageKey));
    currHistoryId++;

    disableArrows(currHistoryId)

    localStorage.setItem(historyIdLocalStorageKey, currHistoryId);
    let historyToDisplay = history[currHistoryId];
    displayHistory(historyToDisplay);
}

function disableArrows(currHistoryId) {

    if(currHistoryId >= 1) {
        showHistoryArrow("left");
    } else {
        hideHistoryArrows("left");
    }

    if(currHistoryId == history.length - 1) {
        hideHistoryArrows("right");
    } else {
        showHistoryArrow("right");
    }
}

function hideHistoryArrows(arrow) {
    switch(arrow) {
        case ("left"):
            document.getElementById("history-left-arrow").style.visibility = "hidden";
            break;
        case ("right"):
            document.getElementById("history-right-arrow").style.visibility = "hidden";
            break;
        case ("both"):
            document.getElementById("history-right-arrow").style.visibility = "hidden";
            document.getElementById("history-left-arrow").style.visibility = "hidden";
            break;
        default:
            return;
    }
}

function showHistoryArrow(arrow) {
    switch(arrow) {
        case ("left"):
            document.getElementById("history-left-arrow").style.visibility = "visible";
            break;
        case ("right"):
            document.getElementById("history-right-arrow").style.visibility = "visible";
            break;
        case ("both"):
            document.getElementById("history-right-arrow").style.visibility = "visible";
            document.getElementById("history-left-arrow").style.visibility = "visible";
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
