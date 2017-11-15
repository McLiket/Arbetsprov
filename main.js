function RemoveItem(e){
    //this is apparently how vanilla js wants it
    var parent = e.parentNode;
    var parentsParent = parent.parentNode;
    parentsParent.removeChild(parent);
}

function SearchModule() {
    //http://www.omdbapi.com/?s=hells&apikey=cb62be7e
    var searchURL = 'http://www.omdbapi.com/';
    var apiKey = 'cb62be7e';
    var autocompleteList = document.getElementsByClassName('search-autocomplete-list')[0];
    var searchInput = document.getElementById('searchInput');
    var resultList = document.getElementsByClassName('search-result-list')[0];
    var searchForm = document.getElementsByClassName('main-search-form')[0];
    var searchTimeout = null;

    AddEventListeners();
    

    function AddEventListeners(){
        if(searchInput != undefined){
            searchInput.addEventListener('keydown', function(){SearchFieldKeyDownListener(event)});
            searchForm.addEventListener('submit',  function(){return AddResultFromSearch(event)});
        }


    }

    function AddResultFromSearch(e) {
        if (searchInput.value != '') {
            var date = (new Date()).toJSON().slice(0,16);
            date = date.replace('T',' ');
            resultList.innerHTML += '<li><span class="result-title">'+searchInput.value+'</span><time>'+date+'</time><button class="search-result-remove" onclick="RemoveItem(this);">Remove item</button></li>';
            searchInput.value = "";
            autocompleteList.innerHTML = "";
        }


        e.preventDefault();
        return false;
    }


    function SearchFieldKeyDownListener(e){
        //Pressing arrow keys (up/down) triggers autocomplete navigation
        if(e.keyCode == 40 || e.keyCode == 38){
            NavigateAutocompleteListKeyboard(e);
            //stop the left/right arrow keys from moving the cursor
            e.preventDefault();
            return false;
        }
        //need at least 3 chars to search
        if(searchInput.value.length<3){
            autocompleteList.innerHTML  = "";
            return;
        }
        //if there is no searchTimeout then we add one for 250ms otherwise we add a new one and reset the time
        if(searchTimeout != null) clearTimeout(searchTimeout);
            searchTimeout =setTimeout(PerformSearch,250);
    }

    function NavigateAutocompleteListKeyboard(e){
        //if there is nothing in the autocomplete list we do nothing
        if(autocompleteList.innerHTML != "" && autocompleteList.innerHTML  != undefined){
            var autoCompleteSuggestions = autocompleteList.getElementsByTagName('li');
            var posOfCurrentSelected = 0;

            //find the position of the currently selected result
            for(var i = 0; i<autoCompleteSuggestions.length;i++){
                if(autoCompleteSuggestions[i].classList.contains('selected-result')){
                    break;
                }
                posOfCurrentSelected++;
            }

            if(e.keyCode == 38){ //up
                //we are at the first position so should jump down
                if(posOfCurrentSelected  == 0){
                    autoCompleteSuggestions[posOfCurrentSelected].className = "";
                    autoCompleteSuggestions[autoCompleteSuggestions.length-1].className += "selected-result";
                    posOfCurrentSelected = autoCompleteSuggestions.length-1;
                    return;
                }
                else{
                    autoCompleteSuggestions[posOfCurrentSelected].className = "";
                    autoCompleteSuggestions[posOfCurrentSelected-1].className += "selected-result";
                    posOfCurrentSelected--;
                }
            }
            else if(e.keyCode == 40){ //down
                //we are at the last position so should jump up again
                if(posOfCurrentSelected  == autoCompleteSuggestions.length-1){
                    autoCompleteSuggestions[posOfCurrentSelected].className = "";
                    autoCompleteSuggestions[0].className += "selected-result";
                    posOfCurrentSelected =0;
                    return;
                }
                else {
                    autoCompleteSuggestions[posOfCurrentSelected].className = "";
                    autoCompleteSuggestions[posOfCurrentSelected+1].className += "selected-result";
                    posOfCurrentSelected++;
                }
            }

            //setting the input field to the value based on autocomplete
            searchInput.value = autoCompleteSuggestions[posOfCurrentSelected].textContent;
        }

    }



    function PerformSearch(){
        var searchTerm = searchInput.value;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', searchURL + '?s='+searchTerm+'&apikey='+apiKey);
        xhr.onload = function() {
            if (xhr.status === 200) {
                currentJsonPars = JSON.parse(xhr.responseText);

                //no results found
                if(currentJsonPars.Response == "False" || currentJsonPars.Search.length == 0){
                    autocompleteList.innerHTML  = "";
                    return;
                }

                var htmlToAdd = "";
                var firstAdded=false;
                currentJsonPars.Search.forEach( function (result)
                {
                    if(!firstAdded) {
                        htmlToAdd = htmlToAdd + "<li class='selected-result'>" + result.Title + "</li>"
                        firstAdded = true;
                    }
                    else{
                        htmlToAdd = htmlToAdd + "<li>" +result.Title + "</li>"
                    }
                });
                autocompleteList.innerHTML = htmlToAdd;
            }
            else {
                alert('Request failed.  Returned status of ' + xhr.status);
            }
        };
        xhr.send();
    }
}
new SearchModule();