const api_url = `http://localhost:8000/api/v1/`

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const table = document.getElementById('table_body')
// console.log('<% user.name %>')
generateTable()

function deleteBuilding(id, name){
        const body = {
            "building": name
        }
        var request = {
            "url" : `${api_url}buildings/${id}`,
            "method" : 'delete',
            "data": body
        }

        if(confirm(`Do you really want to delete ${name}`)){
            $.ajax(request).then(function(){
                alert(`Deleted record : ${name}`);
                location.reload();
            })
        }
}

$("#add_building").submit(function(event){
    alert("Data Inserted Successfully!");
})

$("#update_building").submit((event) =>{
    event.preventDefault();

    var unindexed_array = $("#update_building").serializeArray();
    var data = {}

    $.map(unindexed_array, function(n, i){
        data[n['name']] = n['value']
    })

    var request = {
        "url" : `${api_url}buildings/${data.id}`,
        "method" : "PATCH",
        "data" : data
    }

    $.ajax(request).done(function(response){
        location.assign(`/buildings`);
        alert("Data Updated Successfully!");
        
    })
})

function generateTable(){
    if(params.like == null){
        const table = document.getElementById('table_body')
        var request = {
            url : `${api_url}buildings`,
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
                                        <th width="45%">Nazov</th>
                                        <th width="1%">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id='table_content'>
                                    
                                </tbody>`;
            const result = document.getElementById('table_content')
            mylist.forEach((data) => {
                result.innerHTML += `<tr>
                                    <td>${data.id}</td>
                                    <td>${data.nazov}</td>
                                    <td>  
                                        <a class="btn btn-danger px-3 mb-0" onclick="deleteBuilding('${data.id}', '${data.nazov}')">
                                            <i class="far fa-trash-alt text-light"></i>
                                        </a>
                                        <a class="btn btn-primary px-3 mb-0" href="/buildings/edit/${data.id}">
                                            <i class="fas fa-pencil-alt"></i>
                                        </a>
                                    </td>
                                    </tr>
                                    <tr>
                                    </tr>`
            });
            pageButtons(data.pages)  
        })
    }
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
    if(e.value == null){
        request = {
            url : `${api_url}buildings/search?like=${getSavedValue('search')}`,
            method : 'get',
            body: JSON.stringify({payload: e.value}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }
    }else{
        request = {
            url : `${api_url}buildings/search?like=${e.value}`,
            method : 'get',
            body: JSON.stringify({payload: e.value}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }
    }
    $.ajax(request).then(response => {
        let payload = response.rows
        let data
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
                                    <th width="45%">Nazov</th>
                                    <th width="1%">Actions</th>
                                </tr>
                            </thead>
                            <tbody id='table_content'>
                                
                            </tbody>`;
            const searchResult = document.getElementById('table_content')
            searchResult.innerHTML = ''
            mylist.forEach((data) => {
                // console.log(data.id)
                // console.log(data.nazov)
                searchResult.innerHTML += 
                                        `<tr>
                                        <td>${data.id}</td>
                                        <td>${data.nazov}</td>
                                        <td>  
                                            <a class="btn btn-danger px-3 mb-0" onclick="deleteBuilding('${data.id}', '${data.nazov}')">
                                                <i class="far fa-trash-alt text-light"></i>
                                            </a>
                                            <a class="btn btn-primary px-3 mb-0" href="/buildings/edit/${data.id}">
                                                <i class="fas fa-pencil-alt"></i>
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                    </tr>`
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
//     paramPage = parseInt(params.page)
//     let wrapper = document.getElementById('pagination-wrapper')
//     wrapper.innerHTML=``
//     if(!search){
//         let lastPage = parseInt(params.page) - 1
//         let nextPage = parseInt(params.page) + 1
//         if(pages < 5){
//             if(paramPage != 1 && !(params.page == null)){
//                 console.log(paramPage)
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${lastPage}">Before</a>`
//             }
//             for(var page = 1; page <= pages; page++){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}">${page}</a>`
//             }
//             if(paramPage != pages && params.page == null){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${2}">After</a>`
//             }else if(paramPage != pages){
//                 wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${nextPage}">After</a>`
//             }
//         }
//         else{
//             if(params.page == null || paramPage == 1){
//                 if(pages < 5){
//                     for(var page = 1; page <= pages; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}">${page}</a>`
//                     }
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${2}">After</a>`
//                 }else{
//                     for(var page = 1; page <= 5; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}">${page}</a>`
//                     }
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${2}">After</a>`
//                 }
//             }else{
//                 if((pages - paramPage) < 5){
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 80px;" href="/buildings/?page=${lastPage}">Before</a>`
//                     if(((pages - paramPage) + 1) < 5){
//                         value = pages - paramPage
//                         check = 4 - value
//                         for(var page = paramPage; check != 0;){
//                             console.log(value)
//                             console.log(page)
//                             page -= check
//                             check -= 1
//                             wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}">${page}</a>`
//                             page = paramPage          
//                         }
//                     }
//                     for(var page = paramPage; page <= pages; page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}">${page}</a>`
//                     }
//                     if(paramPage != pages){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${nextPage}">After</a>`
//                     }
//                 }else{
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 80px;" href="/buildings/?page=${lastPage}">Before</a>`
//                     for(var page = paramPage; page <= 5+(paramPage-1); page++){
//                         wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}">${page}</a>`
//                     }
//                     wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${nextPage}">After</a>`
//                 }
//             }
//         }
//         $('.page').on('click',function(){
//             $('#table_body').empty()
//             generateTable($(this).value, null)
//         })
//     }else{
//         for(var page = 1; page <= pages; page++){
//             wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 50px;" href="/buildings/?page=${page}&like=${search}">${page}</a>`
//         }
//         $('.page').on('click',function(){
//             $('#table_body').empty()
//             generateTable()
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

//   console.log(pages)
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
    wrapper.innerHTML = ``
  }

  if (currentPage > 1 && pages > 1) {
    wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${currentPage - 1}">Before</a>`
  }

  for (let i = startPage; i <= endPage; i++) {
    wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page ${i === currentPage ? 'active' : ''}" style="width: 50px;" href="/buildings/?page=${i}${search ? '&like=' + search : ''}">${i}</a>`
  }

  if (currentPage < pages && pages > 1) {
    wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/buildings/?page=${currentPage + 1}">After</a>`
  }

  $('.page').on('click', function() {
    $('#table_body').empty()
    generateTable($(this).data('page'), search)
  })
}

