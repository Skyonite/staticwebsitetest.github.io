// Keeping track of user's vtuber list hinges on using local storage so we check if its available
// It should be available in pretty much every case unless the user has an ancient browser
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}
if (storageAvailable('localStorage')) {
    console.log("local storage is available");
    let vtubercheck = JSON.parse(localStorage.getItem("vtubers"));
    if( vtubercheck === null)
        localStorage.setItem("vtubers","[]");
}
else {
    console.log("local storage unavailable");
}



// Load and populate vtuber lists on page load
window.addEventListener('load',populateList);
window.addEventListener('load',populateDropdown);
// Populates the active vtubers' list
function populateList() {
    //We fetch the up to date json and store it in this array
    let allVtubers = [];
    fetch("https://raw.githubusercontent.com/Skyonite/Vtuberjsontest/master/vtubers.json")
        .then(function (response) {
            return response.json();
        })
        .then( function(data) {
            allVtubers = data;
            // We also fetch the vtubers the user currently has on their list
            vtuberList = JSON.parse(localStorage.getItem("vtubers"));
            let currentVtuber = {};
            // We go through the user's active list and find matches
            for (let i = 0; i < vtuberList.length; i++) {
                for(let j = 0; j < allVtubers.vtuberlist.length; j++){
                    // The vtubers that match have their local values updated
                    if(vtuberList[i].nameRomaji === allVtubers.vtuberlist[j].nameRomaji) {
                        console.log(`compared ${vtuberList[i].nameRomaji} from json and ${allVtubers.vtuberlist[j].nameRomaji} in local storage and found a match`);
                        currentVtuber = allVtubers.vtuberlist[j];
                        updateLocalStorage(currentVtuber);
                        addVtuberInitial(currentVtuber);
                        break;
                    }
                }

            }
        });
}
// Populates all the available vtubers' list
function populateDropdown(){
    // Reads vtuber data from json and stores it as an object
    let allVtubers = {};
    fetch("https://raw.githubusercontent.com/Skyonite/Vtuberjsontest/master/vtubers.json")
        .then(function (response) {
            return response.json();
        })
        .then( function(data){
          allVtubers = data.vtuberlist;
          // Adds each item from the json depending on if its a company or vtuber
          for( let i = 0; i < allVtubers.length; i++){
              let currentVtuber = allVtubers[i];
              if(currentVtuber.type === "Company"){
                createDropdownCompany(currentVtuber);
              }
              if(currentVtuber.type === "youtuber"){
                  createDropdownVtuber(currentVtuber);
              }

          }
            //This adds an event to every vtuber in the dropdown for when they are clicked
            const VtuberListItems = document.querySelectorAll('.vtuber-dropdown-list li');
            for(let i = 0; i < VtuberListItems.length; i++){
                if(!VtuberListItems[i].classList.contains("company"))
                VtuberListItems[i].addEventListener('click', addVtuber);
            }
        })
        .catch(function (err) {
            console.log('error lmew',err);
        });

}

//Creates company in dropdown list
function createDropdownCompany(companyobject){
    const list = document.querySelector('.vtuber-dropdown-list');
    const newLi = document.createElement('li');
    newLi.setAttribute('class','vtuber-dropdown-list-company');
    newLi.classList.add('company');
    const companyName = document.createElement('span');
    companyName.textContent = companyobject.nameRomaji;
    newLi.appendChild(companyName);
    list.appendChild(newLi);
    console.log(`created dropdown list company ${companyobject.nameRomaji}`);
}

//creates individual vtuber in the dropdown list
function createDropdownVtuber(vtuberobject){

            const list = document.querySelector('.vtuber-dropdown-list');

            const newLi = document.createElement('li');

            const newLiImage = document.createElement('img');


            newLiImage.src = vtuberobject.avatarPath;


            newLi.appendChild(newLiImage);
            const vtuberNameRomaji = document.createElement('span');
            const firstbr = document.createElement('br');
            const vtuberNameKana = document.createElement('span');
            const secondbr = document.createElement('br');
            const vtuberNameKanji = document.createElement('span');

            vtuberNameRomaji.textContent = `${vtuberobject.nameRomaji}`;
            vtuberNameKana.textContent = `${vtuberobject.nameKana}`;
            vtuberNameKanji.textContent = `${vtuberobject.nameKanji}`;
            newLi.dataset.nicknames = vtuberobject.nicknames;
            newLi.dataset.company = vtuberobject.company;
            newLi.dataset.nameRomaji = vtuberobject.nameRomaji;


            newLi.appendChild(vtuberNameRomaji);
            newLi.appendChild(firstbr);
            newLi.appendChild(vtuberNameKana);
            newLi.appendChild(secondbr);
            newLi.appendChild(vtuberNameKanji);
            list.appendChild(newLi);
            newLi.addEventListener('click',addVtuber);
            console.log(`created dropdown list item ${vtuberobject.nameRomaji}`);

}

function setLocalStorage(vtuberObject){
    try {
        let vtubersArray = JSON.parse(localStorage.getItem("vtubers"));
        vtubersArray.push(vtuberObject);
        localStorage.setItem("vtubers",JSON.stringify(vtubersArray));
        console.log(`${vtuberObject.nameRomaji} set in local storage`)
    }
    catch(e) {
        console.log(e);
        return e instanceof DOMException;
    }
}

function removeLocalStorage(vtuberNameRomaji) {
    try {
        //We take the locally stored json array into a variable
        let vtuberArray = JSON.parse(localStorage.getItem("vtubers"));
        for (let i = 0; i < vtuberArray.length; i++) {
            //We go through the array and find the matching object
            if (vtuberNameRomaji === vtuberArray[i].nameRomaji) {
                //if the element is at the last position,we just pop it
                if(i === vtuberArray.length - 1){
                    vtuberArray.pop();
                    break;
                }
                //If not, we simply shift every element one index backwards and remove the empty spot
                for (j = i; j < vtuberArray.length - 1; j++) {
                    vtuberArray[j] = Object.assign(vtuberArray[j], vtuberArray[j + 1])
                    if (j === vtuberArray.length - 2) {
                        vtuberArray.length -= 1;
                        break;
                    }
                }
                break;
            }
        }
        //Afterwards we set the modified array back into local storage
        localStorage.setItem("vtubers", JSON.stringify(vtuberArray));
        console.log(`${vtuberNameRomaji} removed from local storage`);
    }
    catch(e){
        console.log(e);

    }
}
function updateLocalStorage(vtuberObject) {
    let vtuberArray = JSON.parse(localStorage.getItem("vtubers"));
    for (let i = 0; i < vtuberArray.length; i++) {
        //We go through the array and find the matching object and update it with the new matching object from the up to date json
        if (vtuberObject.nameRomaji === vtuberArray[i].nameRomaji) {
            let snapshot = vtuberArray[i];
            vtuberArray[i] = Object.assign(vtuberArray[i],vtuberObject);
            console.log(`${snapshot.nameRomaji} was updated to ${vtuberArray[i].nameRomaji} in local storage`);
        }
    }
    localStorage.setItem("vtubers", JSON.stringify(vtuberArray));
}



// Adds a vtuber to the list via what list item was selected from dropdown
async function addVtuber(e) {
    let vtubers = {};

    //first checks all existing added vtubers to see if selected vtuber wasnt already added
    const vtubersInList = document.querySelectorAll('.vtuber-in-list');
    for(let i = 0 ; i < vtubersInList.length; i++){
        if(vtubersInList[i].dataset.nameRomaji === e.target.dataset.nameRomaji ){
            console.log(`Rejected request to add ${e.target.dataset.nameRomaji}`)
            alert("Already in list");
            return 0;
        }
    }

    //Fetch the full list of vtubers from json
    fetch('https://raw.githubusercontent.com/Skyonite/Vtuberjsontest/master/vtubers.json')
        .then(function (response) {
            return response.json();
        })
        .then( function(data) {
            vtubers = data;
            //We look through the json data to find the matching vtuber
            for(let i = 0; i < vtubers.vtuberlist.length ; i++){
                if( (vtubers.vtuberlist[i].type === "youtuber") && (e.target.textContent.includes(vtubers.vtuberlist[i].nameRomaji) ) ) {
                    return vtubers.vtuberlist[i];
                }

            }
            alert("Vtuber not found check json");
            return 0;
        })
        .then ( function(newdata){

            const list = document.querySelector('.vtuber-list');
            let vtuber = newdata;


            //creates a new li element for added vtuber along with the internal content
            const newVtuberInList = document.createElement('li');
            newVtuberInList.setAttribute('class','vtuber-in-list');


            //container for the image, span and close button
            const newVtuberContent = document.createElement('div');
            newVtuberContent.setAttribute('class','vtubercontent');
            newVtuberContent.addEventListener('click',switchActiveVtuber);

            newVtuberContent.dataset.nameRomaji = `${vtuber.nameRomaji}`;
            newVtuberInList.dataset.nameRomaji = `${vtuber.nameRomaji}`;

            //Avatar
            const vtuberAvatar = document.createElement('img');
            vtuberAvatar.src = `${vtuber.avatarPath}`;
            newVtuberContent.appendChild(vtuberAvatar);

            //Removal Button
            const buttonToRemove = document.createElement('button');
            buttonToRemove.addEventListener('click',removeVtuber);
            newVtuberContent.appendChild(buttonToRemove);

            //Name
            const vtuberNameRomaji = document.createElement('span');
            const firstbr = document.createElement('br');
            const vtuberNameKana = document.createElement('span');
            const secondbr = document.createElement('br');
            const vtuberNameKanji = document.createElement('span');


               vtuberNameRomaji.textContent = `${vtuber.nameRomaji}`;
               vtuberNameKana.textContent = `${vtuber.nameKana}`;
               vtuberNameKanji.textContent = `${vtuber.nameKanji}`;

               newVtuberContent.appendChild(vtuberNameRomaji);
               newVtuberContent.appendChild(firstbr);
               newVtuberContent.appendChild(vtuberNameKana);
               newVtuberContent.appendChild(secondbr);
               newVtuberContent.appendChild(vtuberNameKanji);



            //Finally adds it in local storage and appends it to list
            setLocalStorage(vtuber);
            newVtuberInList.appendChild(newVtuberContent);
            list.appendChild(newVtuberInList);
            console.log(`vtuber ${vtuber.nameRomaji} added to sub list`);
        })
        .catch(function (err) {
            console.log('error lmew',err);
        });

}


// This function is called when we populate the page on startup
// Same concept as above function but the input comes from local storage
function addVtuberInitial(VtuberObject) {

            let vtuber = VtuberObject;

            const list = document.querySelector('.vtuber-list');

            //first checks all existing added vtubers to see if selected vtuber wasnt already added
            const vtubersInList = document.querySelectorAll('.vtuber-in-list');
            for(let i = 0 ; i < vtubersInList.length; i++){
                if(vtubersInList[i].textContent.includes(vtuber.nameRomaji) ){
                    alert("Already in list");
                    return 0;
                }
            }

            //creates a new li element for added vtuber along with the internal content
            const newVtuberInList = document.createElement('li');
            newVtuberInList.setAttribute('class','vtuber-in-list');

            //container for the image, span and close button
            const newVtuberContent = document.createElement('div');
            newVtuberContent.setAttribute('class','vtubercontent');
            newVtuberContent.addEventListener('click',switchActiveVtuber);

            //Embed the data in the element itself so we have the data on hand
            newVtuberContent.dataset.nameRomaji = `${vtuber.nameRomaji}`;
            newVtuberInList.dataset.nameRomaji = `${vtuber.nameRomaji}`;


            //Avatar
            const vtuberAvatar = document.createElement('img');
            vtuberAvatar.src = `${vtuber.avatarPath}`;
            newVtuberContent.appendChild(vtuberAvatar);

            //Removal Button
            const buttonToRemove = document.createElement('button');
            buttonToRemove.addEventListener('click',removeVtuber);
            newVtuberContent.appendChild(buttonToRemove);

            //Name
            const vtuberNameRomaji = document.createElement('span');
            const firstbr = document.createElement('br');
            const vtuberNameKana = document.createElement('span');
            const secondbr = document.createElement('br');
            const vtuberNameKanji = document.createElement('span');

            vtuberNameRomaji.textContent = `${vtuber.nameRomaji}`;
            vtuberNameKana.textContent = `${vtuber.nameKana}`;
            vtuberNameKanji.textContent = `${vtuber.nameKanji}`;

            newVtuberContent.appendChild(vtuberNameRomaji);
            newVtuberContent.appendChild(firstbr);
            newVtuberContent.appendChild(vtuberNameKana);
            newVtuberContent.appendChild(secondbr);
            newVtuberContent.appendChild(vtuberNameKanji);


            //Finally appends it to list
            newVtuberInList.appendChild(newVtuberContent);
            list.appendChild(newVtuberInList);
            console.log(`vtuber ${vtuber.nameRomaji} added to sub list via local storage`);


}

//when removal button is clicked this fires and removes the vtuber in list
function removeVtuber(e) {
    removeLocalStorage(e.target.parentNode.dataset.nameRomaji);
    e.target.parentNode.parentNode.remove();
    e.stopPropagation();
}

//When a vtuber in the sub list is clicked on, swaps the rest of the page accordingly
function switchActiveVtuber(e){

    //Get references to elements we'll be modifying
    const vtuberImage = document.querySelector('.profile-image');
    const vtuberRomajiName = document.querySelector('.romaji-name');
    const vtuberJPName = document.querySelector('.name');
    const youtubeLink = document.querySelector('.yt-link');
    const twitterLink = document.querySelector('.twitter-link');
    const youtubeEmbed = document.querySelector('.current-vtuber-stream-container');
    //const youtubeEmbedThumbnail = document.querySelector('.current-vtuber-stream-container img');
    const youtubeEmbedButton = document.querySelector('.current-vtuber-stream-button');
    const twitterFeedContainer = document.querySelector('#vtuber-twitter');

    let vtuberArray = JSON.parse(localStorage.getItem("vtubers"));
    let vtuber = {};
    for(let i = 0 ; i < vtuberArray.length ; i++){
        if(vtuberArray[i].nameRomaji === e.target.dataset.nameRomaji){
            vtuber = vtuberArray[i];
            console.log(`found the vtuber ${vtuber.nameRomaji} in local storage`);
        }

    }

    //Modify the elements based on the data we embedded in the vtuber list element
    vtuberImage.src = vtuber.avatarPath;
    vtuberRomajiName.textContent = vtuber.nameRomaji;
    vtuberJPName.textContent = vtuber.nameKanji;
    youtubeLink.href = vtuber.youtubeLink;
    twitterLink.href = vtuber.twitterLink;

    //This is just to remove the default placeholder pic displayed as default
    const initialThumbnail = document.querySelector('.current-vtuber-stream-container > img');
    if( initialThumbnail)
        initialThumbnail.remove();

    //Sets the upcoming stream time to new selecter vtuber
    countDownDate = vtuber.nextScheduledStreamTime[0];

    //Get the links and titles for the past broadcasts
    let prevBroadcasts = vtuber.pastBroadcasts;
    let prevBroadcastsTitles = vtuber.pastBroadcastsTitles;

    //If there is already an embed, remove it and make a new one
    let prevIframeCheck = document.querySelector('.current-vtuber-stream-container iframe')
    if (  prevIframeCheck ) {
        let prevIframe = document.querySelector('.current-vtuber-stream-container iframe');
        prevIframe.remove();
    }
    let iframe = document.createElement( "iframe" );
    iframe.setAttribute( "frameborder", "0" );
    iframe.setAttribute( "allowfullscreen", "" );
    if( countDownDate === "false" || countDownDate === "start" ) {
        iframe.setAttribute("src", "https://www.youtube.com/embed/" + prevBroadcasts[0] + "?rel=0&showinfo=0&autoplay=0");
    }
    else {
        iframe.setAttribute("src", "https://www.youtube.com/embed/" + vtuber.nextScheduledStream[0] + "?rel=0&showinfo=0&autoplay=0");
    }
    youtubeEmbed.appendChild( iframe );
    youtubeEmbedButton.addEventListener('click',function hidePlayButton() {
        youtubeEmbedButton.classList.remove('show');
    });


    //Swaps twitter timeline to new vtuber
    let prevTwitterTimeline = document.querySelector('#vtuber-twitter a, #vtuber-twitter iframe')
    if(prevTwitterTimeline) {
        prevTwitterTimeline.remove();
        console.log("removed twitter iframe");
    }
    let twitterIframe = document.createElement('a');
    twitterFeedContainer.appendChild(twitterIframe);
    twitterIframe.outerHTML = `<a class="twitter-timeline" href="${vtuber.twitterLink}" data-chrome="noheader nofooter noborders noscrollbar"></a>`;
    console.log(`created twitter iframe for ${vtuber.nameRomaji}`);
     if(twttr.widgets.load())
         console.log("widget loaded for " + vtuber.twitterLink);

     //Populates recent videos list
     //Make a reference to the container
    const prevBroadcastsContainer = document.querySelector('.prev-broadcasts-container')

    //Checking for a previous prev broadcasts list
    const checkForResiduePrevBroadcasts = document.querySelector('.prev-broadcasts-list');
    if(checkForResiduePrevBroadcasts)
        checkForResiduePrevBroadcasts.remove();
    //Now we make the money(list)
    const prevBroadcastsList = document.createElement('ul');
    prevBroadcastsList.setAttribute('class','prev-broadcasts-list');
    prevBroadcastsContainer.appendChild(prevBroadcastsList);
    for(let i = 0 ; i < 4 ; i++) {
        const prevBroadcast = document.createElement('li');
        const prevBroadcastImage = document.createElement('img');
        prevBroadcastImage.src = `https://img.youtube.com/vi/${prevBroadcasts[i]}/mqdefault.jpg`;
        prevBroadcast.appendChild(prevBroadcastImage);
        const prevBroadcastTitle = document.createElement('span');
        prevBroadcastTitle.textContent = prevBroadcastsTitles[i];
        prevBroadcast.appendChild(prevBroadcastTitle);
        const br = document.createElement('br');
        prevBroadcast.appendChild(br);
        const publishedTime = document.createElement('span');
        publishedTime.textContent = ` ago`;
        prevBroadcast.appendChild(publishedTime);
        prevBroadcast.dataset.url = prevBroadcasts[i];
        prevBroadcast.addEventListener('click',swapActiveVideo);
        prevBroadcastsList.appendChild(prevBroadcast);
    }



    console.log(`Page context swapped to ${vtuber.nameRomaji}`);
    e.stopPropagation();

}
function swapActiveVideo(e){
    const youtubeEmbed = document.querySelector('.current-vtuber-stream-container');
    //If there is already an embed, remove it and make a new one
    let prevIframeCheck = document.querySelector('.current-vtuber-stream-container iframe')
    if (  prevIframeCheck ) {
        let prevIframe = document.querySelector('.current-vtuber-stream-container iframe');
        prevIframe.remove();
    }
    let iframe = document.createElement( "iframe" );
    iframe.setAttribute( "frameborder", "0" );
    iframe.setAttribute( "allowfullscreen", "" );
    iframe.setAttribute("src", "https://www.youtube.com/embed/" + e.target.dataset.url + "?rel=0&showinfo=0&autoplay=0");
    youtubeEmbed.appendChild( iframe );
    console.log(`Embedded video swapped`);
}


//Adding events for the search bar
const searchBox = document.querySelector('.search-box');
searchBox.addEventListener('focus',dropdownList);
searchBox.addEventListener('keyup',searchList);

// When its in focus the dropdown list is shown
function dropdownList() {
    const dropdown = document.querySelector('.vtuber-dropdown-list');
    dropdown.classList.add('show');
}


//When user types a letter in the search box this searches all elements in the dropdown
function searchList(){
    let input = document.querySelector('.search-box').value;
    input=input.toLowerCase();
    let x = document.querySelectorAll('.vtuber-dropdown-list li');
    for (i = 0; i < x.length; i++) {
        if(!(x[i].dataset.nicknames === undefined)){
           if (x[i].innerHTML.toLowerCase().includes(input) || x[i].dataset.nicknames.toLowerCase().includes(input) || x[i].dataset.company.toLowerCase().includes(input)) {
                x[i].style.display="list-item";
            }
           else {
                x[i].style.display="none";
           }
        }
    }
}
//if user clicks outside of the searchbox or dropdown, hides the dropdown
window.addEventListener('click',hideDropdown);
function hideDropdown(e) {
    if (!event.target.matches('.search-box')) {
        let dropdowns = document.querySelectorAll(".vtuber-dropdown-list");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Set the date we're counting down to
let countDownDate = 'start';

// Update the count down every 1 second
let x = setInterval(function() {

    // Get today's date and time
    let now = new Date().getTime();
    // Find the distance between now and the count down date
    let distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result
    document.getElementById("stream-timer").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";


    switch( countDownDate){
        case 'false':
            document.getElementById("stream-timer").innerHTML = "No Scheduled Stream";
            break;
        case 'start':
            document.getElementById("stream-timer").innerHTML = "";
            break;
        case distance < 0:
            document.getElementById("stream-timer").innerHTML = "Started is live";
            break;
    }

}, 1000);

