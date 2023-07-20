const api_url = `http://localhost:8000/api/v1/`

$("#update_mrtg").submit((event) =>{
    event.preventDefault();
    var unindexed_array = $("#update_mrtg").serializeArray();
    var data = {}

    // var newUrl = document.getElementsByName('url').value;
    // console.log(newUrl)
    $.map(unindexed_array, function(n, i){
        data[n['name']] = n['value']
    })

    var request = {
        "url" : `${api_url}mrtgserver/${data.id}`,
        "method" : "PATCH",
        "data" : data
    }

    $.ajax(request).done(function(res){
        location.assign(`/admin`);
        alert("Mrtg Server Updated Successfuly!");
    })
})