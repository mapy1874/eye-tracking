async function getAvailableIDs (){
    const IDs = [];
    let resp = await fetch("https://gb.cs.unc.edu/json/drop", {
      headers: { Accept: "application/json" }
    });
    // console.log("get resp", resp);
    let data = await resp.json();
    console.log("get data", data);  
    for (drop of data.drops){
      IDs.push(drop.id);
    }
    return IDs;
}

function showInput() {
    if (document.getElementById("starting_index").value == "" ||
        document.getElementById("ending_index").value == "") {
            alert("please input something")
            return;
        }
    let start = Number(document.getElementById("starting_index").value);
    let end = Number(document.getElementById("ending_index").value);
    // renderData(start, end);
}

async function getAllExamples(start, end){
    const allData = [];
    const availableIDs = await getAvailableIDs();
    const promiseList = [];
    for (let i = start; i <= end&&i<availableIDs.length; i++){
        promiseList.push(
            fetch("https://gb.cs.unc.edu/json/drop/"+availableIDs[i], {
                method: 'GET',
            }).then(async (resp)=>{
                if (resp.status >= 200 && resp.status < 300) {
                    // to avoid 404 response etc
                    console.log("get resp", resp);
                    let data = await resp.json();
                    console.log("get data", data);
                    // let newItem = await JSON.stringify(data);
                    await allData.push({"eyeImage":data["x"]["eyeImage"],
                                        "y":[data["y"][0].toPrecision(3),
                                            data["y"][1].toPrecision(3)],
                                        "id":availableIDs[i]});
                }
            }).catch(()=>{
                console.log("error");
            })
        )   
    }
    return Promise.all(promiseList).then(()=>{
        return allData;
    });    
}

async function tripleClickHandler(event) {
    if (event.detail === 3) {
        // delete the data from the db
        console.log("https://gb.cs.unc.edu/json/drop/"+event.target.alt);
        fetch("https://gb.cs.unc.edu/json/drop/"+event.target.alt, {
                method: 'DELETE',
            }).then(async (resp)=>{
                event.target.removeEventListener("click",tripleClickHandler);
            }).catch(()=>{
                alert("delete unsuccessfully!");
        });
    }
}
async function renderData(start, end){
    getAllExamples(start, end).then((allData) => {

        var container = document.getElementById('imageContainer');
        var docFrag = document.createDocumentFragment();
        
        allData.forEach(function(data, index, originalArray) {
            var figure = document.createElement('figure');

            var img = document.createElement('img');
            img.src = data["eyeImage"];
            img.alt = data["id"].toString();
            img.addEventListener('click', tripleClickHandler);


            var y = document.createElement('figcaption');
            y.innerHTML = "y: " + data["y"].toString();
            var id = document.createElement('figcaption');
            id.innerHTML = "id: " + data["id"].toString();

            figure.appendChild(img);
            figure.appendChild(y);
            figure.appendChild(id);
            
              
            docFrag.appendChild(figure)
        });
        container.appendChild(docFrag);        
    })
}


