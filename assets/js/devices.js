const api_url = `http://localhost:8000/api/v1/`

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const table = document.getElementById('table_body')

generateTable()
generateSelect()


function generateSelect(){
    var request = {
        "url": `${api_url}buildings`,
        "method": 'GET'
    }
    $.ajax(request).then(function(response){
        var data = response
        // console.log(data)
        const selectBuilding = document.getElementById('select-buildings')
        data.forEach((d)=>{
            // console.log(d)
            selectBuilding.innerHTML +=
                `<option value="${d.id}">${d.nazov}</option>`
        })
    })
    var selectElement = document.getElementById("select-building")
    selectElement.addEventListener("change", function() {
        var selectedOption = selectElement.options[selectElement.selectedIndex].value
        // console.log("Selected Option:",selectedOption)
        if(selectedOption !== '' || selectedOption !== 0){
            document.getElementById('second-select').style.display = "block";
            var request = {
                "url": `${api_url}locations/building/${selectedOption}`,
                "method": 'GET'
            }
            $.ajax(request).then(function(response){
                var data = response
                // console.log(data)
                const selectLocation = document.getElementById('select-locations')
                selectLocation.innerHTML = 
                    `<option value="0">Vyber Lokality</option>`
                data.forEach((location)=>{
                    // console.log(location)
                    selectLocation.innerHTML += 
                        `<option value="${location.id}">${location.nazov}</option>`
                })
            }) 
        }
        else{
            return 0
        }
    })
}

function changeSwitchmap(id){
    var request = {
        "url" : `${api_url}devices/${id}`,
        "method" : 'get'
        }
    // Make GET request to get current switchmap value
    $.ajax(request).done(function(response) {
        var currentSwitchmap = response[0].switchmap;
        var swname = response[0].swname

        // Determine new switchmap value
        var newSwitchmap = currentSwitchmap == 0 ? 1 : 0;
        var data = {
            switchmap: newSwitchmap,
            swname: swname
        }

        var updateRequest = {
            "url" : `${api_url}devices/${id}`,
            "method" : 'PATCH',
            "data" : data,
        }

        $.ajax(updateRequest).done(function(newResponse) {
        // Make PATCH request to update switchmap value
            location.assign(`/devices`);
            alert("SwitchMap Updated Successfully!");
        })
    });
}

function getBuildingName(id, i){
    var request = {
        "url" : `${api_url}buildings/${id}`,
        "method" : 'GET'
    }
    $.ajax(request).then(function(response){
        var nazov = response[0].nazov
        document.getElementById("budova_nazov"+i).innerHTML = nazov
    })
}

function getLocationName(id, i){
    var request = {
        "url" : `${api_url}locations/${id}`,
        "method" : 'GET'
    }
    $.ajax(request).then(function(response){
        var nazov = response[0].nazov
        document.getElementById("lokalita_nazov"+i).innerHTML = nazov
    })
}

function deleteDevice(id, name){
    const body = {
        "device": name
    }

    var request = {
        "url" : `${api_url}devices/${id}`,
        "method" : 'DELETE',
        "data": body
    }

    if(confirm(`Do you really want to delete ${name}`)){
        $.ajax(request).then(function(){
            alert(`Deleted record : ${name}`);
            location.reload();
        })
    }
}

$("#add_device").submit(function(event){
    alert("Data Inserted Successfully!");
})

$("#update_device").submit((event) =>{
    event.preventDefault();

    var unindexed_array = $("#update_device").serializeArray();
    var data = {}

    $.map(unindexed_array, function(n, i){
        data[n['name']] = n['value']
    })

    var request = {
        "url" : `${api_url}devices/${data.id}`,
        "method" : "PATCH",
        "data" : data
    }

    $.ajax(request).done(function(response){
        location.assign(`/devices`);
        alert("Data Updated Successfully!");
        
    })
})

function generateTable(){
    if(params.like == null){
        const table = document.getElementById('table_body')
        var request = {
            url : `${api_url}devices`,
            method: 'get',
        }
        $.ajax(request).then(response => {
            let payload = response
            let data
            if(params.page == null){
                data = pagination(payload, 1, 15)
            }else{
                data = pagination(payload, params.page, 15)
            }
            let mylist = data.querySet
            table.innerHTML =`<thead>
                                    <tr>
                                        <th width="5%">ID</th>
                                        <th width="15%">Nazov Switcha</th>
                                        <th width="10%">IP Switcha</th>
                                        <th width="20%">Lokalita</th>
                                        <th width="10%">Budova</th>
                                        <th width="8%">SNMP Community</th>
                                        <th width="15%">Uptime</th>
                                        <th width="12%">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id='table_content'>
                                    
                                </tbody>`;
            const result = document.getElementById('table_content')
            mylist.forEach((data, index) => {
                if(data.switchmap == 1){
                    result.innerHTML += `<tr>
                                        <td>${data.id}</td>
                                        <td>${data.swname}</td>
                                        <td>${data.swip}</td>
                                        <td id="lokalita_nazov${index}" class="lokalita_nazov" target="${data.idlokalita}"></td>
                                        <td id="budova_nazov${index}" class="budova_nazov" target="${data.idbudova}"></td>
                                        <td>${data.snmpcomunity}</td>
                                        <td>${data.snmpuptime}</td>
                                        <td>
                                            <div class="d-flex justify-content-center">
                                                <a class="btn btn-danger px-3 mb-0" onclick="deleteDevice('${data.id}', '${data.swname}')">
                                                    <i class="far fa-trash-alt text-light"></i>
                                                </a>
                                                <a class="btn btn-primary px-3 mb-0" href="/devices/edit/${data.id}">
                                                    <i class="fas fa-pencil-alt"></i>
                                                </a>
                                            </div>
                                            <a id="switchmap" class="btn btn-primary px-3 mt-2" onclick="changeSwitchmap('${data.id}')">
                                                SwitchMap Enabled
                                            </a>
                                        </td>
                                        </tr>
                                        <tr>
                                        </tr>`
                }
                else{
                    result.innerHTML += `<tr>
                                        <td>${data.id}</td>
                                        <td>${data.swname}</td>
                                        <td>${data.swip}</td>
                                        <td id="lokalita_nazov${index}" class="lokalita_nazov" target="${data.idlokalita}"></td>
                                        <td id="budova_nazov${index}" class="budova_nazov" target="${data.idbudova}"></td>
                                        <td>${data.snmpcomunity}</td>
                                        <td>${data.snmpuptime}</td>
                                        <td>  
                                            <div class="d-flex justify-content-center">
                                                <a class="btn btn-danger px-3 mb-0" onclick="deleteDevice('${data.id}', '${data.swname}')">
                                                    <i class="far fa-trash-alt text-light"></i>
                                                </a>
                                                <a class="btn btn-primary px-3 mb-0" href="/devices/edit/${data.id}">
                                                    <i class="fas fa-pencil-alt"></i>
                                                </a>
                                            </div>
                                            <a id="switchmap" class="btn btn-primary px-3 mt-2" onclick="changeSwitchmap('${data.id}')">
                                                SwitchMap Disabled
                                            </a>
                                        </td>
                                        </tr>
                                        <tr>
                                        </tr>`    
                }
                let budova = document.querySelector("#budova_nazov"+index)
                getBuildingName(budova.getAttribute('target'), index)
                let lokalita = document.querySelector("#lokalita_nazov"+index)
                getLocationName(lokalita.getAttribute('target'), index)
            });
            pageButtons(data.pages)  
        })
    }else{
        sendData(params.like)
    }
}

function saveSearchBy(e){
    var id = e.id
    var val = e.value
    localStorage.setItem(id, val)
}

//Save the value function - save it to localStorage as (ID, VALUE)
function saveValue(e){
    var id = e.id;  // get the sender's id to save it . 
    var val = e.value; // get the value. 
    localStorage.setItem(id, val);// Every time user writing something, the localStorage's value will override . 
}

//get the saved value function - return the value of "v" from localStorage. 
function getSavedValue(v){
    if (!localStorage.getItem(v)) {
        return ""; 
    }
    return localStorage.getItem(v);
}

async function sendData(e){
    const table = document.getElementById('table_body')
    const selectedOption = document.getElementById('searchBy').value
    // console.log(selectedOption)
    // console.log(getSavedValue('search'))
    // console.log(getSavedValue('searchBy'))
    if(e.value == null){
        request = {
            url : `${api_url}devices/search?like=${getSavedValue('search')}&searchBy=${getSavedValue('searchBy')}`,
            method : 'get',
            body: JSON.stringify({payload: e.value}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }
    }else{
        request = {
            url : `${api_url}devices/search?like=${e.value}&searchBy=${selectedOption}`,
            method : 'get',
            body: JSON.stringify({payload: e.value}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }
    }
    $.ajax(request).then(response => {
        let payload = response.rows
        let data
        // console.log('Page', params.page)
        // console.log('Like', params.like)
        // console.log('Save', getSavedValue('search'))
        // console.log(e.value)
        if(params.page == null || (params.page == null && (params.like != e.value)) || (params.like != getSavedValue('search'))){
            data = pagination(payload, 1, 15)
        }else{
            data = pagination(payload, params.page, 15)
        }
        let mylist = data.querySet
        if(mylist.length > 0){
            table.innerHTML =`<thead>
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="15%">Nazov Switcha</th>
                                    <th width="10%">IP Switcha</th>
                                    <th width="20%">Lokalita</th>
                                    <th width="10%">Budova</th>
                                    <th width="8%">SNMP Community</th>
                                    <th width="15%">Uptime</th>
                                    <th width="12%">Actions</th>
                                </tr>
                            </thead>
                            <tbody id='table_content'>
                                
                            </tbody>`;
            const searchResult = document.getElementById('table_content')
            searchResult.innerHTML = ''
            mylist.forEach((data, index) => {
                if(data.switchmap == 1){
                    searchResult.innerHTML += `<tr>
                                        <td>${data.id}</td>
                                        <td>${data.swname}</td>
                                        <td>${data.swip}</td>
                                        <td id="lokalita_nazov${index}" class="lokalita_nazov" target="${data.idlokalita}"></td>
                                        <td id="budova_nazov${index}" class="budova_nazov" target="${data.idbudova}"></td>
                                        <td>${data.snmpcomunity}</td>
                                        <td>${data.snmpuptime}</td>
                                        <td>
                                            <div class="d-flex justify-content-center">
                                                <a class="btn btn-danger px-3 mb-0" onclick="deleteDevice('${data.id}', '${data.swname}')">
                                                    <i class="far fa-trash-alt text-light"></i>
                                                </a>
                                                <a class="btn btn-primary px-3 mb-0" href="/devices/edit/${data.id}">
                                                    <i class="fas fa-pencil-alt"></i>
                                                </a>
                                            </div>
                                            <a id="switchmap" class="btn btn-primary px-3 mt-2" onclick="changeSwitchmap('${data.id}')">
                                                SwitchMap Enabled
                                            </a>
                                        </td>
                                        </tr>
                                        <tr>
                                        </tr>`
                }
                else{
                    searchResult.innerHTML += `<tr>
                                        <td>${data.id}</td>
                                        <td>${data.swname}</td>
                                        <td>${data.swip}</td>
                                        <td id="lokalita_nazov${index}" class="lokalita_nazov" target="${data.idlokalita}"></td>
                                        <td id="budova_nazov${index}" class="budova_nazov" target="${data.idbudova}"></td>
                                        <td>${data.snmpcomunity}</td>
                                        <td>${data.snmpuptime}</td>
                                        <td>  
                                            <div class="d-flex justify-content-center">
                                                <a class="btn btn-danger px-3 mb-0" onclick="deleteDevice('${data.id}', '${data.swname}')">
                                                    <i class="far fa-trash-alt text-light"></i>
                                                </a>
                                                <a class="btn btn-primary px-3 mb-0" href="/devices/edit/${data.id}">
                                                    <i class="fas fa-pencil-alt"></i>
                                                </a>
                                            </div>
                                            <a id="switchmap" class="btn btn-primary px-3 mt-2" onclick="changeSwitchmap('${data.id}')">
                                                SwitchMap Disabled
                                            </a>
                                        </td>
                                        </tr>
                                        <tr>
                                        </tr>`    
                }
                let budova = document.querySelector("#budova_nazov"+index)
                getBuildingName(budova.getAttribute('target'), index)
                let lokalita = document.querySelector("#lokalita_nazov"+index)
                getLocationName(lokalita.getAttribute('target'), index)

            });
            if(e.value == null){
                pageButtons(data.pages, getSavedValue('search'))
            }else{
                pageButtons(data.pages, e.value)  
            }
        }else{
            table.innerHTML = `<p class="d-flex justify-content-center"> No Results Found </p>`
            if(e.value == null){
                pageButtons(data.pages, getSavedValue('search'))
            }else{
                pageButtons(data.pages, e.value)  
            }
        }
        return;
    })
}

function pagination(payload, page, resultsPerPage){
    
    let trimStart = (page - 1) * resultsPerPage
    let trimEnd = trimStart + resultsPerPage
    let trimmedData 
    let pages = Math.ceil(payload.length / resultsPerPage)
    if(payload.length > resultsPerPage){
        trimmedData = payload.slice(trimStart, trimEnd)
    }else{
        trimmedData = payload
    }
    return{
        'querySet': trimmedData,
        'pages': pages
    }
}

// Prototype pagination, might be of some use in the future

// async function pageButtons(pages, search){
//     console.log(getSavedValue('search'))
//     paramPage = parseInt(params.page)
//     let wrapper = document.getElementById('pagination-wrapper')
//     wrapper.innerHTML=``
//     if(getSavedValue('search') == null || getSavedValue('search') == ''){
//         console.log('No Search Used')
//         let lastPage = parseInt(params.page) - 1
//         let nextPage = parseInt(params.page) + 1
//         if(pages < 5){
//             if(paramPage != 1 && !(params.page == null)){
//                 console.log(paramPage)
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${lastPage}">Before</a>`
//             }
//             for(var page = 1; page <= pages; page++){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}">${page}</a>`
//             }
//             if(paramPage != pages && pages > 1 && params.page==null){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${2}">After</a>`
//             }
//             else if(paramPage != pages){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}">After</a>`
//             }
//         }
//         else{
//             if(params.page == null || paramPage == 1){
//                 for(var page = 1; page <= 5; page++){
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}">${page}</a>`
//                 }
//                 if(paramPage != pages && pages > 1 && params.page==null){
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${2}">After</a>`
//                 }
//                 else if(paramPage != pages){
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}">After</a>`
//                 }
//             }else{
//                 if((pages - paramPage) < 5){
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 80px;" href="/devices/?page=${lastPage}">Before</a>`
//                     if(((pages - paramPage) + 1) < 5){
//                         value = pages - paramPage
//                         check = 4 - value
//                         for(var page = paramPage; check != 0;){
//                             console.log(value)
//                             console.log(page)
//                             page -= check
//                             check -= 1
//                             wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}">${page}</a>`
//                             page = paramPage          
//                         }
//                     }
//                     for(var page = paramPage; page <= pages; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}">${page}</a>`
//                     }
//                     if(paramPage != pages){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}">After</a>`
//                     }
//                 }else{
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 80px;" href="/devices/?page=${lastPage}">Before</a>`
//                     for(var page = paramPage; page <= 5+(paramPage-1); page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}">${page}</a>`
//                     }
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}">After</a>`
//                 }
//             }
//         }
//         $('.page').on('click',function(){
//             $('#table_body').empty()
//             generateTable($(this).value, null)
//         })
//     }else{
//         search = getSavedValue('search')
//         let lastPage = parseInt(params.page) - 1
//         let nextPage = parseInt(params.page) + 1
//         if(pages == 0){
//             console.log('No Results Found')
//         }
//         else if(pages == 1){
//             console.log('One Page Found')
//         }
//         else if(pages < 5){
//             // console.log(params.like)
//             // console.log(getSavedValue('search'))
//             // console.log(pages)
//             if(params.like != getSavedValue('search')){
//                 search = getSavedValue('search')
//             }
//             // console.log(params.like)
//             // console.log(getSavedValue('search'))
//             // console.log(pages)
//             // console.log(paramPage)
//             if(paramPage != 1 && !(params.page == null)){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${lastPage}&like=${search}">Before</a>`
//             }
//             for(var page = 1; page <= pages; page++){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}&like=${search}">${page}</a>`
//             }
//             if(paramPage != pages && pages > 1 && params.page==null){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${2}&like=${search}">After</a>`
//             }
//             else if(paramPage != pages && pages > 1){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}&like=${search}">After</a>`
//             }
//         }
//         else{
//             if(params.page == null || paramPage == 1){
//                 if(pages < 5){
//                     for(var page = 1; page <= pages; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}&like=${search}">${page}</a>`
//                     }
//                 }else{
//                     for(var page = 1; page <= 5; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}&like=${search}">${page}</a>`
//                     }
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${2}">After</a>`
//                 }
//             }else{
//                 if((pages - paramPage) < 5){
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 80px;" href="/devices/?page=${lastPage}&like=${search}">Before</a>`
//                     if(((pages - paramPage) + 1) < 5){
//                         value = pages - paramPage
//                         check = 4 - value
//                         for(var page = paramPage; check != 0;){
//                             console.log(value)
//                             console.log(page)
//                             page -= check
//                             check -= 1
//                             wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}&like=${search}">${page}</a>`
//                             page = paramPage          
//                         }
//                     }
//                     for(var page = paramPage; page <= pages; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}&like=${search}">${page}</a>`
//                     }
//                     if(paramPage != pages){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}&like=${search}">After</a>`
//                     }
//                 }else{
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 80px;" href="/devices/?page=${lastPage}&like=${search}">Before</a>`
//                     for(var page = paramPage; page <= 5+(paramPage-1); page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/devices/?page=${page}&like=${search}">${page}</a>`
//                     }
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${nextPage}&like=${search}">After</a>`
//                 }
//             }
//         }
//         $('.page').on('click',function(){
//             $('#table_body').empty()
//             generateTable($(this).value, null)
//         })
//     }
// }

async function pageButtons(pages, search) {
    const currentPage = parseInt(params.page) || 1
    const maxVisiblePages = 5
    const wrapper = document.getElementById('pagination-wrapper')
    wrapper.innerHTML = ''
  
    let startPage = 1
    let endPage = pages
  
    // console.log(pages)
    if (pages > maxVisiblePages) {
      if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
        endPage = maxVisiblePages
      } else if (currentPage >= pages - Math.floor(maxVisiblePages / 2)) {
        startPage = pages - maxVisiblePages + 1
      } else {
        startPage = currentPage - Math.floor(maxVisiblePages / 2)
        endPage = startPage + maxVisiblePages - 1
      }
    }
  
    if(pages < 1){
      wrapper.innerHTML === ``
    }
  
    if (currentPage > 1 && pages > 1) {
      wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${currentPage - 1}">Before</a>`
    }
  
    for (let i = startPage; i <= endPage; i++) {
      wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page ${i === currentPage ? 'active' : ''}" style="width: 50px;" href="/devices/?page=${i}${search ? '&like=' + search : ''}">${i}</a>`
    }
  
    if (currentPage < pages && pages > 1) {
      wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/devices/?page=${currentPage + 1}">After</a>`
    }
  
    $('.page').on('click', function() {
      $('#table_body').empty()
      generateTable($(this).data('page'), search)
    })
  }
  

