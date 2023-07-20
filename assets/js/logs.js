const api_url = `http://localhost:8000/api/v1/`

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

generateTable()

async function generateTable(){
    const table = document.getElementById('table_body')
    if(params.like == null){
        var request = {
            url : `${api_url}logs`,
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
                                        <th width="30%">User</th>
                                        <th width="35%">Action</th>
                                        <th width="30%">Date</th>
                                    </tr>
                                </thead>
                                <tbody id='table_content'>
                                    
                                </tbody>`;
            const result = document.getElementById('table_content')
            mylist.forEach((data) => {
                result.innerHTML += `<tr>
                                        <td>${data.id}</td>
                                        <td>${data.user}</td>
                                        <td>${data.udalost}</td>
                                        <td>${data.datum}</td>
                                    </tr>
                                    <tr>
                                    </tr>`
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
    if(e.value == null){
        request = {
            url : `${api_url}logs/search?like=${getSavedValue('search')}&searchBy=${getSavedValue('searchBy')}`,
            method : 'get',
            body: JSON.stringify({payload: e.value}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }
    }else{
        request = {
            url : `${api_url}logs/search?like=${e.value}&searchBy=${selectedOption}`,
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
                                    <th width="30%">User</th>
                                    <th width="35%">Action</th>
                                    <th width="30%">Date</th>
                                </tr>
                            </thead>
                            <tbody id='table_content'>
                                
                            </tbody>`;
            const searchResult = document.getElementById('table_content')
            searchResult.innerHTML = ''
            mylist.forEach((data) => {
                searchResult.innerHTML +=`<tr>
                                            <td>${data.id}</td>
                                            <td>${data.user}</td>
                                            <td>${data.udalost}</td>
                                            <td>${data.datum}</td>
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
    // console.log('Payload INSIDE', payload)
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
      wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/logs/?page=${currentPage - 1}">Before</a>`
    }
  
    for (let i = startPage; i <= endPage; i++) {
      wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page ${i === currentPage ? 'active' : ''}" style="width: 50px;" href="/logs/?page=${i}${search ? '&like=' + search : ''}">${i}</a>`
    }
  
    if (currentPage < pages && pages > 1) {
      wrapper.innerHTML += `<a class="btn bg-gradient-dark mb-0 mx-2 page" style="width: 75px;" href="/logs/?page=${currentPage + 1}">After</a>`
    }
  
    $('.page').on('click', function() {
      $('#table_body').empty()
      generateTable($(this).data('page'), search)
    })
  }
  