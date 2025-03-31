
const historyLocalStorageKey = "calculation-history";
const historyMax = 10;
const history = [];
let historyId = 1;


document.getElementById("calculator-input-form").addEventListener('submit', (event) => {  
    event.preventDefault();
    saveCalculation();
})

function saveCalculation() { 

    var currStorage = localStorage.getItem(historyLocalStorageKey);

    var obj = JSON.parse(currStorage);
    if(Array.isArray(obj) && obj.length >= historyMax ) {
        history.shift();
    }

    var jobTitle = document.getElementById("jobTitle").value;
    var grossPay = document.getElementById("grossPay").value;
    var timeFrame = document.getElementById("timeframe").value;
    var hoursPerWeek = document.getElementById("hoursPerWeek").value;
    var taxRate = document.getElementById("taxRate").value;
    var niRate = document.getElementById("taxRate").value;

    const calculation = {
        id: historyId++,
        jobTitle: jobTitle,
        grossPay: grossPay,
        timeFrame: timeFrame,
        hoursPerWeek: hoursPerWeek,
        taxRate: taxRate,
        niRate: niRate
    };

    history.push(calculation);
    localStorage.setItem("calculation-history", JSON.stringify(history))
}

function storeHistory() {
    
}