window.addEventListener("load", async (event) => {
    const vacanciesList = document.getElementById("vacancies-list");

    let data = JSON.parse(localStorage.getItem("vacancies-data"));

    if(data === null || data.length == 0) {
        console.log("Fetching Api Data");
        data = await GetData();
        localStorage.setItem("vacancies-data", JSON.stringify(data));  
    }

    const firstFive = data.splice(0, 5);
    firstFive.forEach(job => {
        createNewVacanciesCard(vacanciesList, job);
    })

    setUpExpandableCard();
});

async function GetData() {
    const url = "https://api.lmiforall.org.uk/api/v1/vacancies/search";
    
    try {
        const response = await fetch(url);
        const json = await response.json();  
        return json; 
    } catch (error) {
        console.error('Error:', error);
    }
}

function setUpExpandableCard() {
    const showMoreElements = document.querySelectorAll('.vacancies-card-expandable-show-more');

    showMoreElements.forEach(element => element.addEventListener('click', (event) => {
        event.preventDefault();

        const expandableContent = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable');
        const showLessButton = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable-show-less');
        const showMoreButton = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable-show-more');
        showMoreButton.scrollIntoView();

        expandableContent.style.display = "block";
        showLessButton.style.display = "block";
        showMoreButton.style.display = "none";
    }));
    
    const showLessElements = document.querySelectorAll('.vacancies-card-expandable-show-less');

    showLessElements.forEach(element => element.addEventListener('click', (event) => {
        event.preventDefault();

        const topOfContent = element.closest('.vacancies-card');
        const expandableContent = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable');
        const showLessButton = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable-show-less');
        const showMoreButton = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable-show-more');
        topOfContent.scrollIntoView({ behavior: 'smooth', block: 'start' });

        expandableContent.style.display = "none";
        showLessButton.style.display = "none";
        showMoreButton.style.display = "block";
    }));
}


function createNewVacanciesCard(element, data) {
    let newCard = document.createElement("div");
    newCard.classList.add("vacancies-card");

    let newJobTitle = document.createElement("h2");
    newJobTitle.innerHTML = data.title;
    newJobTitle.classList.add("vacancies-card-job-title");
    newCard.appendChild(newJobTitle);

    let expandableContent = createExpandableContent(data);
    newCard.appendChild(expandableContent);

    let showMoreButton = document.createElement("button");
    showMoreButton.innerHTML = "Show More";
    showMoreButton.classList.add("vacancies-card-expandable-show-more");
    newCard.appendChild(showMoreButton);

    let showLessButton = document.createElement("button");
    showLessButton.innerHTML = "Show Less";
    showLessButton.classList.add("vacancies-card-expandable-show-less");
    newCard.appendChild(showLessButton);

    element.appendChild(newCard);
}

function createExpandableContent(data) {
    let expandableCard = document.createElement("div");
    expandableCard.classList.add("vacancies-card-expandable");

    let company = document.createElement("h3");
    company.innerHTML = "Company";

    let companyContent = document.createElement("p");
    companyContent.innerHTML = data.company;

    let closeDate = document.createElement("h3");
    closeDate.innerHTML = "Application Closing Date";

    let closeDateContent = document.createElement("p");
    closeDateContent.innerHTML = data.activedate.end.split('T')[0];

    let location = document.createElement("h3");
    location.innerHTML = "Location";

    let locationContent = document.createElement("p");
    locationContent.innerHTML = data.location.location;

    let jobLink = document.createElement("h3");
    jobLink.innerHTML = "Job Link";

    let jobLinkContent = document.createElement("a");
    jobLinkContent.href = data.link;
    jobLinkContent.target = "_blank"
    let jobLinkText = document.createElement("p")
    jobLinkText.innerHTML = "Click Here"
    jobLinkContent.appendChild(jobLinkText);

    let summary = document.createElement("h3");
    summary.innerHTML = "Summary";

    let summaryContent = document.createElement("p");
    summaryContent.innerHTML = data.summary;

    expandableCard.appendChild(company);
    expandableCard.appendChild(companyContent);
    expandableCard.appendChild(closeDate);
    expandableCard.appendChild(closeDateContent);
    expandableCard.appendChild(location);
    expandableCard.appendChild(locationContent);
    expandableCard.appendChild(jobLink);
    expandableCard.appendChild(jobLinkContent);
    expandableCard.appendChild(summary);
    expandableCard.appendChild(summaryContent)
    return expandableCard;
}