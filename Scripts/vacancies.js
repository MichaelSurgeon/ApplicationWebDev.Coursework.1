let filteredData = []
let currPageSize = 10;

async function load(event) {

    const filters = getFilters();

    url = getUrlFromSearchFilter(filters);

    const data = await GetDataAsync(url);
    
    if(!data) {
        alert("Request limit hit, (refresh after two seconds)")
        return;
    }

    filteredData = getLocationFilteredData(filters, data)
    if(filteredData.length < 10) {
        document.getElementById("vacancies-next").style.display = "none";
        document.getElementById("vacancies-back").style.display = "none";
    } else {
        document.getElementById("vacancies-next").style.display = "block";
    }

    await GenerateData(filteredData.slice(0, 10));
}

function getUrlFromSearchFilter(filters) {
    let url = "https://api.lmiforall.org.uk/api/v1/vacancies/search";
    const searchFilter = filters.get("search");

    if(searchFilter) {
        const existingSearchChip = document.querySelector(".filter-buble[filter-chip-type='search']");
        if(!existingSearchChip) {
        createFilterChips(searchFilter, "search");
        }

        url = url + `?keywords=${searchFilter}`;
    }

    return url;
}

function getLocationFilteredData(filters, data) {
    const locationFilter = filters.get("location");
    
    if(locationFilter) {
        const existingLocationChip = document.querySelector(".filter-buble[filter-chip-type='location']");
        if(!existingLocationChip) {
        createFilterChips(locationFilter, "location");
        }

        let filteredData = [];
        data.forEach(job => {
            if(job.location.location.includes(locationFilter)) {
                filteredData.push(job);
            }
        })
        return filteredData;
    }
    return data;
}

async function GetDataAsync(url) {
    try {
        let response = await fetch(url);

        if(response.status != 200)
        {
            console.log("Error - Status Code: " + response.status);
            setTimeout(async function() 
            { 
                response = await fetch(url); 
            }, 2000);
            return;
        }

        if(response) {
            const json = await response.json();  
            return json; 
        }

        return null;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function GenerateData(data) {
    const cards = document.getElementsByClassName("vacancies-card");
    while (cards.length > 0) {
        cards[0].remove(); 
    }    
    
    let spinnerIcon = document.getElementById("vacancies-spinner");
    spinnerIcon.style.display = "block";


    for (let job of data) {
        let jobInformation = await GetDataAsync(`https://api.lmiforall.org.uk/api/v1/soc/search?q=${job.title}`);
        
        for (let info of jobInformation) {
            for (let jt of info.add_titles) {
                if (jt.toLowerCase() === job.title.toLowerCase()) {
                    job.description = info.description;
                    job.tasks = info.tasks;
                }
            }
        }

        createNewVacanciesCard(job);
    }

    spinnerIcon.style.display = "none";

    setUpExpandableCard();
}

async function handleSearchSubmit(event) {
    event.preventDefault();
    removeFilterFromState("search");

    let searchQuery = document.getElementById("vacancies-search-box").value;
    let inputBox = document.getElementById("vacancies-search-box");

    if (!searchQuery) {
        inputBox.style.border = "2px solid red";
        inputBox.placeholder = "You Must Enter A Value";
        return;
    }

    inputBox.style.border = "1px solid black";
    inputBox.placeholder = "Software Engineer";

    let existingSearchChip = document.querySelector("[filter-chip-type='search']");
    if (existingSearchChip) {
        existingSearchChip.remove();
    }

    document.getElementById('vacancies-form').reset();
    addFilterToState("search", searchQuery);
    createFilterChips(searchQuery, "search");
    load();
}

function openFilterOverlay(event) {
    event.preventDefault();

    document.body.style.overflow = "hidden";
    document.getElementById("filters-overlay").style.display = "block";

    let filtersLocation = document.getElementById("filters-location");

    if (filteredData.length > 0 && filtersLocation) {
        const locations = [...new Set(filteredData.map(d => d.location.location))]; 
        locations.forEach(loc => {
            let option = document.createElement("option");
            option.value = loc;
            option.innerHTML = loc;
            filtersLocation.appendChild(option);
        });
    }
}

function closeFilterOverlay(event) {
    event.preventDefault();

    document.body.style.overflow = "visible";
    document.getElementById("filters-overlay").style.display = "none";
}

function handleFilterSubmit(event) {
    event.preventDefault();

    const location = document.getElementById("filters-location").value;
    addFilterToState("location", location);
    createFilterChips(location, "location");

    document.body.style.overflow = "visible";
    document.getElementById("filters-overlay").style.display = "none";
    load();
}

function setUpExpandableCard() {
    const showMoreElements = document.querySelectorAll('.vacancies-card-expandable-show-more');

    showMoreElements.forEach(element => element.addEventListener('click', (event) => {
        event.preventDefault();

        const expandableContent = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable');
        const showLessButton = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable-show-less');
        const showMoreButton = element.closest('.vacancies-card').querySelector('.vacancies-card-expandable-show-more');

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

function createNewVacanciesCard(data) {
    const element = document.getElementById("vacancies-list");

    let newCard = document.createElement("div");
    newCard.classList.add("vacancies-card");

    let newJobTitle = document.createElement("h2");
    newJobTitle.innerHTML = data.title;
    newJobTitle.classList.add("vacancies-card-job-title");
    newCard.appendChild(newJobTitle);

    let generalInformationDiv = document.createElement("div");
    generalInformationDiv.classList.add("vacancies-card-general");

    if(data.description && data.tasks){    
        let description = document.createElement("h3");
        description.innerHTML = "Description";

        let generalInformationDesc = document.createElement("p");
        generalInformationDesc.innerHTML = data.description;

        let tasks = document.createElement("h3");
        tasks.innerHTML = "Tasks";

        let generalInformationTasks = document.createElement("p");
        generalInformationTasks.innerHTML = data.tasks;

        generalInformationDiv.appendChild(description)
        generalInformationDiv.appendChild(generalInformationDesc);
        generalInformationDiv.appendChild(tasks)
        generalInformationDiv.appendChild(generalInformationTasks);
    } 
    else 
    {
        let general = document.createElement("h3");
        general.innerHTML = "General Information";
        generalInformationDiv.appendChild(general);

        let generalInformationGeneric = document.createElement("p");
        generalInformationGeneric.innerHTML = "Could not find any relevant information.";
        generalInformationDiv.appendChild(generalInformationGeneric);
    }
    newCard.appendChild(generalInformationDiv);


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
    closeDate.innerHTML = "Closing Date";

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

function createFilterChips(content, type) {
    const filtersDiv = document.getElementById("filters");

    let filterBubble = document.createElement("filter-buble");
    filterBubble.setAttribute('filter-chip-type', type)
    filterBubble.classList.add("filter-buble");

    let filterContent = document.createElement("p");
    filterContent.innerHTML = content;

    let filterCloseIcon = document.createElement("img");
    filterCloseIcon.classList.add("filter-buble-img");
    filterCloseIcon.src = "./Assets/images/close-icon-white.svg";
    filterCloseIcon.style.width = "15px";

    filterBubble.appendChild(filterContent);
    filterBubble.appendChild(filterCloseIcon);
    filtersDiv.appendChild(filterBubble);

    setFilterListners();
}

function setFilterListners() {
    const filterClose = document.querySelectorAll('.filter-buble-img');

    filterClose.forEach(element => element.addEventListener('click', async (event) => {
        event.stopPropagation();
        event.preventDefault();

        const closestChip = element.closest('.filter-buble');
        const filterType = closestChip.getAttribute("filter-chip-type");
        closestChip.remove();
        removeFilterFromState(filterType);
        load();
    }));
}

function addFilterToState(filterName, data) {
    const url = getUrl();
    url.searchParams.append(filterName, data);
    window.history.pushState({}, '', url);
}

function removeFilterFromState(filterName){
    const url = getUrl();
    url.searchParams.delete(filterName);
    window.history.pushState({}, '', url);
}

function getFilters() {
    return getUrl().searchParams;
}

function getUrl(){
    return new URL(window.location.href);
}

// Page issue h

async function nextPage() {
    const header = document.getElementById("header-container");
    header.scrollIntoView();

    validatePaginationButtons(currPageSize + 10);

    await GenerateData(filteredData.slice(currPageSize, currPageSize + 10));
    currPageSize += 10;
    header.scrollIntoView();
}

async function lastPage() {
    const header = document.getElementById("header-container");
    header.scrollIntoView();

    validatePaginationButtons(currPageSize - 10);

    await GenerateData(filteredData.slice(currPageSize - 20, currPageSize - 10));
    currPageSize -= 10;
}

function validatePaginationButtons(value) {
    if(value >= filteredData.length) {
        document.getElementById("vacancies-next").style.display = "none";
    } else {
        document.getElementById("vacancies-next").style.display = "block";
    }
    
    if(value >= 20) {
        document.getElementById("vacancies-back").style.display = "block";
    } else {
        document.getElementById("vacancies-back").style.display = "none";
    }
}

document.getElementById("vacancies-submit-button").addEventListener('click', handleSearchSubmit);
document.getElementById("filter-button").addEventListener('click', openFilterOverlay);
document.getElementById("filters-pop-up-close").addEventListener('click', closeFilterOverlay);
document.getElementById("filters-submit").addEventListener('click', handleFilterSubmit);
document.getElementById("vacancies-next").addEventListener('click', nextPage);
document.getElementById("vacancies-back").addEventListener('click', lastPage);
window.addEventListener("load", load);