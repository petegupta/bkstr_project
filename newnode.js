import fetch from 'node-fetch';
import * as fs from 'fs';
// ,"acadiastore","adelphistore"
//const storeNames = ["academyofourladypeacestore","acadiastore","adelphistore"];
const storeNames = ["academyofourladypeacestore"];

storeNames.forEach(function(strName,index){
    var storeName = strName; 
    var store_id = getStore(strName);
    var J = 0;
    store_id.then(async function(strid){
        var strId = strid.storeId;
        console.log('store id = ',strId);
        // get termId and programId
        var term_id = getTerm(strId);
        await term_id.then(async function(termVal){
            var termId = termVal[0];
            var programId = termVal[1];
            console.log('term id = ',termId);
            console.log('program id = ',programId);
            var department = getDaprtment(strId,termId);
            var depName;
            var courseName;
            await department.then((value) => {
                var dep = value.finalDDCSData.division[0].department;
                // save dep array in json filename will be bkstr_'+storeName+'_'+storeId+'_'+termId+'_department.json',data
                var depFile = JSON.stringify(dep);
                    fs.writeFile('./bkstr_deps/bkstr_'+storeName+'_'+strId+'_'+termId+'_department.json',depFile, function (err) {
                        if (err) throw err;
                        console.log('Department Saved');
                    });
                var fullData = [];
                var i = 0;
                var j = 0;
                console.log('department = ',dep);
                dep.forEach((val,index) => {
                    depName = val.depName;
                    val.course.forEach((val2,index2)=>{
                        courseName = val2.courseName;
                        val2.section.forEach((val3,index3)=>{
                            let section = val3.sectionName;
                            let course = {"secondaryvalues":depName+"/"+courseName+"/"+section,"divisionDisplayName":"","departmentDisplayName":depName,"courseDisplayName":courseName,"sectionDisplayName":section};
                            if(i<20){
                                fullData.push(course);
                                i++;
                            }else{
                                // Create a function 
                                J++;
                                // return;
                                try{
                                    // get and store course data
                                    console.log('IN Store Data Function');
                                    storeData(storeName,strId,termId,programId,depName,courseName,J,fullData);
                                    i=0;
                                    fullData = [];
                                    return false;
                                } catch(err){
                                    console.log(err);
                                }
                            }
                        })
                    })
                });
            if(i>0){
                // get and store course data
                storeData(storeName,strId,termId,programId,depName,courseName,J,fullData);
            }
            // After for loop  check if i > 0 then you have to call getCourses for remianing course data and save it this is why i asked you to creat function under try  
            });
        })
    })
});
//"termId":"100070381","termName":"Fall 2021","programId":"1902"





// const course =  getCourses(storeId,termId,programId)
// const courselist = JSON.stringify(course)
// console.log(courselist)

//get storeId from link of arrays.
async function getStore(storeName) {
    wait();
    const str =  await fetch(`https://svc.bkstr.com/store/config?storeName=${storeName}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
    })
    
    const ret = await str.json();  
    return ret;  
}

//get termId and programId from storeId
async function getTerm(storeId) {
    wait();
    const str =  await fetch(`https://svc.bkstr.com/courseMaterial/info?storeId=${storeId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
    });

    const ret = await str.json();  
    // console.log('term id and program id');
    var termId = ret.finalData?.campus[0]?.program[0]?.term[0]?.termId;
    var programId = ret.finalData?.campus[0]?.program[0]?.programId;
    var termData = [termId,programId];
    return termData;  
}

async function getDaprtment(storeId,termId) {
    wait();
const d =  await fetch(`https://svc.bkstr.com/courseMaterial/courses?storeId=${storeId}&termId=${termId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        },
    })
    const ret = await d.json();  
    console.log('dpartment');
    console.log(ret.finalDDCSData?.division[0]?.department);
    return ret;  
}

async function getCourses(storeId,termId,programId,fullData) {
    // wait();
const rest = await fetch(`https://svc.bkstr.com/courseMaterial/results?storeId=${storeId}&langId=-1&requestType=DDCSBrowse`, {
    method: 'POST',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        },
        body: '{"storeId":'+storeId+',"termId":'+termId+',"programId":'+programId+',"courses":'+fullData+'}'
    });
    const ret = await rest.json();   
    return ret;  
}

function wait(ms){
    ms = ms || false;
    if (!ms) {
        ms = generateTimeStamp(3000, 10000);
    }
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

function generateTimeStamp(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function storeData(storeName,strId,termId,programId,depName,courseName,J,fullData){
    console.log("Sending 20-data of ",storeName,", ",depName,", ",courseName," and section send to get course and book details.");
    //console.log('fullData',fullData);
    const newData = JSON.stringify(fullData);
    const getData = await getCourses(strId,termId,programId,newData);
    await getData.then(function(value) {
        console.log('course details and books of given data.', value);
        const data = JSON.stringify(value);
        fs.writeFile('./bkstr/bkstr_'+storeName+'_'+termId+'_'+depName+'_'+courseName+'_'+J+'.json',data, function (err) {
            if (err) { 
                throw err;
            }
            console.log('storeData Saved');
        });
    })
}
    // var ran = (Math.random()*12) + 3;
    // console.log("waiting for:",ran," seconds");
    // wait(ran*1000);
    // i=0;
    // fullData = [];


// function timeout(ms) {
//     return new Promise(res => setTimeout(res, ms));
// }
