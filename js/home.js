const DOMAIN = 'https://qi-management.herokuapp.com/admin';
const QI_PATH = '/quarantine-information';

let currentPageOfAPI = sessionStorage.getItem('currentPage');
let fromValue = sessionStorage.getItem('from');
let destinationValue = sessionStorage.getItem('destination');
if (fromValue == null) {
    fromValue = 'ALL';
}
if (destinationValue == null) {
    destinationValue = 'ALL';
}
console.log('currentPage of API: ' + currentPageOfAPI + '\nfrom ' + fromValue + ' destination: ' + destinationValue);




let xhr = new XMLHttpRequest();
let content = document.getElementById('block-content');
let pagination = document.getElementById('home-page-pagination');
let fromProvince = document.getElementById('from');
let destination = document.getElementById('destination');


function loadBody() {
    loadOptionsOfSelects();
    getQuarantineInformationList(currentPageOfAPI, fromValue, destinationValue);
    console.log("loaded body");
}


function getQuarantineInformationList(page, fromOptionValue, destinationOptionValue) {
    if (page == null) {
        page = 0;
    }
    let params, response;
    params = '?page=' + page + '&originFrom=' + fromOptionValue + '&destination=' + destinationOptionValue;
    console.log('params: ' + params);

    xhr.open('GET', DOMAIN + QI_PATH + params, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.response);
            console.log(response);

            if (response.quarantineInformationList == null) {
                content.innerText = 'No data to display';
            } 
            if (response.quarantineInformationList != null) {
                displayPagination(response.totalPage);
                response.quarantineInformationList.forEach(element => displayBlockQuarantineInformation(element));
                loadPaginationIndexActive(currentPageOfAPI, response.totalPage);
            }
            loadEventListeners();
            removeLoaderAfterLoadedBody();


        } else if (this.status == 401 || this.status == 400) {
            console.log(this.status);
            alert("Technical error");
            return;
        } else if (this.status == 208) {
            console.log(this.status);
            alert("Already created the quarantine information, please update it.");
            return;
        }
    };
    xhr.send();
}

function displayBlockQuarantineInformation(element) {
    content.innerHTML +=
        `<div class="row block-qi" id="` + element.id + `">
        <div class="container inside-block-qi">
            <div class="row date-valid-block-qi">
                    <p class="text">From ` + element.startAt + returnEndDate(element.endAt) + `: this information will valid</p>
                    ` + checkQuarantineInformationStatus(element.status) + `
            </div>
            <hr>
            <div class="row content-block-qi">
                <p class="text from-place">` + PROVINCE[element.originFrom].vi + `</p>
                <p class="text fixed-text">will isolate people come from</p>
                <p class="text destination-place">` + PROVINCE[element.destination].vi + `</p>
            </div>
            <div class="row reason-updated">
                ` + checkReasonUpdated(element.status, element.reasonUpdated) + `
            </div>
            <div class="row float-right date-created-block-qi">
                <div class="col">
                    <p class="text">Created At:</p>
                    <p class="text">` + element.createdAt + `</p>
                </div>
            </div>
        </div>
    </div>`;
}

function returnEndDate(endDate) {
    if (endDate == null) {
        return ``;
    }
    return ` To ` + endDate;
}

function checkQuarantineInformationStatus(status = 'NEW') {
    if (isUpdatedStatus(status)) {
        return `<p class="text" style="color:red;font-size:13px;">` + status + `</p>`;
    }
    return ``;
}

function checkReasonUpdated(status, reasonUpdated) {
    if (isUpdatedStatus(status)) {
        return `<p class="text">Reason Updated: </p>
                <p class="text">` + reasonUpdated + `</p>`;
    }
    return ``;
}

function isUpdatedStatus(status) {
    if (status == 'UPDATED') {
        return true;
    }
    return false;
}

function displayPagination(totalPage) {
    pagination.innerHTML +=
        `
    <li class="page-item" id="previous">
        <a class="page-link" href="#" aria-label="Previous" id="previous-item">
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>
    ` + displayPageNumber(totalPage) + `
    <li class="page-item" id="next">
        <a class="page-link" href="#" aria-label="Next" id="next-item">
            <span aria-hidden="true">&raquo;</span>
        </a>
    </li>
    `;
}

function displayPageNumber(totalPage) {
    let pages = `<li class="page-item" id="page-item-1"><a class="page-link" href="#" id="page-1">1</a></li>`;
    for (let i = 2; i <= totalPage; i++) {
        pages += `<li class="page-item" id="page-item-` + i + `"><a class="page-link" href="#" id="page-` + i + `">` + i + `</a></li>`;
    }
    return pages;
}

function loadEventListeners() {
    // pagination items listener
    addPaginationItemsListener();
    // select buttons listener
    addOptionSelectsListener();
}

function addPaginationItemsListener() {
    var pageLinks = document.getElementsByClassName('page-link');
    for (var i = 0; i < pageLinks.length; i++) {
        let pageLinkId = pageLinks[i].id;
        console.log('pageLinkId ' + pageLinkId);
        let pageNumber = spliterator(pageLinkId)[1];
        if (Number.isNaN(Number(pageNumber))) {
            switch (pageLinkId) {
                case 'previous-item': {
                    var previousButton = document.getElementById('previous-item');
                    previousButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        var previousPage = Number(currentPageOfAPI) - 1;
                        console.log('previous item, current page of API: ' + currentPageOfAPI + 'previousPage: ' + previousPage);
                        sessionStorage.setItem("currentPage", previousPage);
                        location.reload();
                    })
                    break;
                }
                case 'next-item': {
                    var nextButton = document.getElementById('next-item');
                    nextButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        var nextPage = Number(currentPageOfAPI) + 1;
                        console.log('next item, current page of API: ' + currentPageOfAPI + ' nextPage: ' + nextPage);
                        sessionStorage.setItem("currentPage", nextPage);
                        location.reload();
                    })
                    break;
                }
            }
        } else {
            let pageItem = document.getElementById('page-' + pageNumber);
            pageItem.addEventListener('click', function () {
                console.log('clicked ');
                currentPageOfAPI = Number(pageNumber) - 1;
                sessionStorage.setItem("currentPage", currentPageOfAPI);
                location.reload();
            })
        }
    }
}

function addOptionSelectsListener() {
    fromProvince.addEventListener('click', function() {
        // set page to 0
        sessionStorage.setItem("from", fromProvince.value);
        sessionStorage.setItem("currentPage", 0);
        location.reload();
    })
    destination.addEventListener('click', function() {
        // set page = 0
        console.log(destination.value);
        sessionStorage.setItem("destination", destination.value);
        sessionStorage.setItem("currentPage", 0);
        location.reload();
    })
}


function loadOptionsOfSelects() {
    // Add options to selects
    for (const key of Object.keys(PROVINCE)) {
        addOptionsToSelectFrom(fromProvince, key);
        addOptionsToSelectDestination(destination, key);
    }

    addOptionAllToSelect(fromProvince,'ALL');
    addOptionAllToSelect(destination,'ALL');
    
    if (fromValue != null) {
        fromProvince.value = fromValue;
        if (fromValue != 'ALL') {
            var destinationDisable = document.getElementById('DESTINATION_' + fromValue);
            destinationDisable.setAttribute('disabled', true);

        }
    } 
    if (destinationValue != null) {
        destination.value = destinationValue;
        if (destinationValue != 'ALL') {
            var fromDisable = document.getElementById('FROM_' + destinationValue);
            fromDisable.setAttribute('disabled', true);
        }
    }
}

function addOptionsToSelectFrom(fromProvinceElement, key) {
    var option = document.createElement("option");
    option.text = PROVINCE[key].vi;
    option.setAttribute('value', PROVINCE[key].enum);
    option.setAttribute('id', 'FROM_' + PROVINCE[key].enum);
    fromProvinceElement.add(option, fromProvinceElement[-1]);
}

function addOptionsToSelectDestination(destinationElement, key) {
    var option = document.createElement("option");
    option.text = PROVINCE[key].vi;
    option.setAttribute('value', PROVINCE[key].enum);
    option.setAttribute('id', 'DESTINATION_' + PROVINCE[key].enum);
    destinationElement.add(option, destinationElement[-1]);
}

function addOptionAllToSelect(element, all="ALL") {
    var option = document.createElement("option");
    option.text = all;
    option.setAttribute('value', all);
    option.setAttribute('selected', true)
    element.add(option, element[0]);
}


function spliterator(input) {
    return input.split('-');
}

function loadPaginationIndexActive(currentPageIndexOfAPI, totalPage) {
    if (currentPageIndexOfAPI == null) {
        currentPageIndexOfAPI = 0;
    }
    var currentPageOfPagination = Number(currentPageIndexOfAPI) + 1;
    var previous = document.getElementById('previous');
    var next = document.getElementById('next');

    if (totalPage == 1) {
        previous.classList.add('disabled');
        next.classList.add('disabled');
    }
    if (currentPageOfPagination == 1) {
        previous.classList.add('disabled');
    } else if (currentPageOfPagination == totalPage) {
        next.classList.add('disabled');
    }

    var paginationIndex = document.getElementById('page-item-' + currentPageOfPagination);
    paginationIndex.classList.add('active');
}

function removeLoaderAfterLoadedBody() {
    var loader = document.getElementById('loader');
    loader.remove();
}