const api_url = `http://localhost:8000/api/v1/`
const result = document.getElementById('buildings-locations')

generateTable()

async function sendData(search){
    var devices = document.getElementById('searchDevices')
    var isIP = /^\d{0,3}(\.\d{0,3}){0,3}$/.test(search.value);
    devices.innerHTML = ''
    if(search.value !== ''){
        if(isIP == true){
            var request = {
                url: `${api_url}devices/search?like=${search.value}&limit=5&searchBy=ip`,
                method: 'get',
            }
            $.ajax(request).then(response => {
                // console.log(response)
                data = response.rows
                data.forEach((dev) => {
                    devices.innerHTML += `<li>
                                            <a class="nav-link" href="mrtg/${dev.swip}">
                                                <span class="nav-link-text ms-1">${dev.swname}</span>
                                            </a>
                                            </li>`
                })
            })
        }else{
            var request = {
                url: `${api_url}devices/search?like=${search.value}&limit=5`,
                method: 'get',
            }
            $.ajax(request).then(response => {
                // console.log(response)
                data = response.rows
                data.forEach((dev) => {
                    devices.innerHTML += `<li>
                                            <a class="nav-link" href="mrtg/${dev.swip}">
                                                <span class="nav-link-text ms-1">${dev.swname}</span>
                                            </a>
                                            </li>`
                })
            })
        }
    }else{
        devices.innerHTML = ''
    }
}

function toggle_visibility(locationid){
    locationid = parseInt(locationid)
    let location = document.getElementById(`lokalita${locationid}`)
    if(location.style.display === 'none'){
        location.style.display = 'block'
        var request = {
            url: `${api_url}locations`,
            method: 'get',
        }
        $.ajax(request).then(response => {
            response.forEach((data) => {
                // console.log("locationid:", locationid, "data.id:", data.id);
                if(locationid !== data.id){
                    let locToHide = document.getElementById(`lokalita${data.id}`)
                    locToHide.style.display = "none"
                }
            })
        })
    }
}

function generateTable(){
    var request = {
        url : `${api_url}buildings`,
        method: 'get',
    }
    $.ajax(request).then(response => {
        response.forEach((data) => {
            // console.log(data)
            result.innerHTML += `<span class="nav-link-text ms-1">${data.nazov}</span>
                                <ul>
                   
                                        <ul id="building${data.id}">
                                        </ul>
                                </ul>`
                var requestLocation = {
                    url : `${api_url}locations/building/${data.id}`,
                    method: 'get',
                }
                $.ajax(requestLocation).then(responseLoc => { 
                    responseLoc.forEach((location) => {
                        var building = document.getElementById(`building${location.budovaid}`)
                        // console.log(loc)
                        building.innerHTML += `<li>
                                                <a class="nav-link" href="javascript:void(1)" onclick="toggle_visibility('${location.id}')">
                                                    <span class="nav-link-text ms-1">${location.nazov}</span>
                                                </a>
                                                <div id="lokalita${location.id}" style="display:none"></div>
                                                </li>`
                        var requestDevices = {
                            url : `${api_url}devices/location/${location.id}`,
                            method: 'get',
                        }
                        $.ajax(requestDevices).then(responseDev => { 
                            responseDev.forEach((device) => {
                                var loc = document.getElementById(`lokalita${device.idlokalita}`)
                                loc.innerHTML += `<ul>
                                                    <a href="mrtg/${device.swip}">${device.swname}</a>
                                                    </ul?>`                
                            })
                        })
                    })
                })
            })
    })
}