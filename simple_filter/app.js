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
      console.log(IDs)
    }
    return IDs;
}


async function getAllExamples(start, end){
    const allData = [];
    const availableIDs = await getAvailableIDs();
    const promiseList = [];
    for (let i = start; i <= end&&i<availableIDs.length; i++){
        console.log("pushing");
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
                                        "y":data["y"],
                                        "id":availableIDs[i]});
                }
            }).catch(()=>{
                console.log("error");
            })
        )   
    }
    Promise.all(promiseList).then(()=>{
        return allData;
    });    
}

async function renderData(){
    var allData = await getAllExamples(0,100);
    var container = document.getElementById('imageContainer');
    var docFrag = document.createDocumentFragment();
    
    allData.forEach(function(data, index, originalArray) {
        var img = document.createElement('img');
        img.src = data["eyeImage"];
        docFrag.appendChild(img);
    });
    
    container.appendChild(docFrag);    
}

renderData();