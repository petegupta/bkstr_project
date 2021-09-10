import fetch from 'node-fetch';
import * as fs from 'fs';
// ,"acadiastore","adelphistore"
const storeNames[1] = ["academyofourladypeacestore","acadiastore","adelphistore"];

storeNames.forEach(function(strName,index){
    var storeName = strName; 
    var store_id = getStore(strName);
    var J = 0;
    store_id.then(async function(strid){
        var strId = strid.storeId;
        // get termId and programId
        var term_id = getTerm(strId);
        wait(200);   
        await term_id.then(async function(termVal){
            var termId = termVal[0];
            var programId = termVal[1];
            console.log(strId,termId,programId); 
            var department = getDaprtment(strId,termId);
            wait(500);   
            var depName;
            var courseName;
            await department.then((value) => {
                var dep = value.finalDDCSData.division[0].department;
		        // save dep array in json filename will be bkstr_'+storeName+'_'+storeId+'_'+termId+'_department.json',data
		     	fs.writeFile('./bkstr_deps/bkstr_'+storeName+'_'+strId+'_'+termId+'__department.json', JSON.stringify(dep), function (err) { if (err) throw err;
                        console.log('Saved!');
                    	});
		        wait(300); 
                var fullData = [];
                var i = 0;
                var j = 0;
            	dep.forEach((val,index) => {
                    depName = val.depName;
                  	val.course.forEach((val2,index2)=>{
            			courseName = val2.courseName;
            			val2.section.forEach((val3,index3)=>{
            				let section = val3.sectionName;
                            let course = {"secondaryvalues":depName+"/"+courseName+"/"+section,"divisionDisplayName":"","departmentDisplayName":depName,"courseDisplayName":courseName,"sectionDisplayName":section};
                            // await timeout(3000);
                            // await new Promise(resolve => setTimeout(resolve,1000));
                            // wait(1000);
                            // console.log(course);
                            if(i<20){
                                fullData.push(course);
                                i++;
                            }else{
				                // Create a function 
				                J++;
                                // return;
                                try{
                                    // get and store course data
                                    storeData(storeName,strId,termId,programId,depName,courseName,J,fullData);
                                    var ran = (Math.random()*5) + 3;
                                    console.log("waiting for:",ran," seconds");
                                    wait(ran*1000);
                                    i=0;
                                    fullData = [];
                                    // console.log("hello");
                                }catch(err){
                                    console.log(err);
                                }
                            }
            			})
            		})
            	});
		    if(i>0){
                // get and store course data
                storeData(storeName,strId,termId,programId,depName,courseName,J,fullData);
                var ran = (Math.random()*12) + 3;
                console.log("waiting for:",ran," seconds");
                wait(ran*1000);
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
    const str =  await fetch(`https://svc.bkstr.com/store/config?storeName=${storeName}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        },
    })
    const ret = await str.json();  
    // console.log('store id');
    return ret;  
}

//get termId and programId from storeId
async function getTerm(storeId) {
    const str =  await fetch(`https://svc.bkstr.com/courseMaterial/info?storeId=${storeId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        },
    })
    const ret = await str.json();  
    // console.log('term id and program id');
    var termId = ret.finalData?.campus[0]?.program[0]?.term[0]?.termId;
    var programId = ret.finalData?.campus[0]?.program[0]?.programId;
    var termData = [termId,programId];
    return termData;  
}

async function getDaprtment(storeId,termId) {
const d =  await fetch(`https://svc.bkstr.com/courseMaterial/courses?storeId=${storeId}&termId=${termId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
		'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        },
    })
    const ret = await d.json();  
    console.log('dpartment');
    console.log(ret.finalDDCSData?.division[0]?.department);
    return ret;  
}

const rest = await fetch(`https://svc.bkstr.com/courseMaterial/results?storeId=${storeId}&langId=-1&requestType=DDCSBrowse`, {
    method: 'POST',
    headers: {
		'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        },
		body: '{"storeId":'+storeId+',"termId":'+termId+',"programId":'+programId+',"courses":'+fullData+'}'
    });
    const ret = await rest.json();   
    return ret;  
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
}

async function storeData(storeName,strId,termId,programId,depName,courseName,J,fullData){
    console.log("Sending 20-data of ",storeName,", ",depName,", ",courseName," and section send to get course and book details.");
    // console.log(fullData);
    var newData = JSON.stringify(fullData);
    var getData = await getCourses(strId,termId,programId,newData);
    getData.then((value)=>{
        console.log('course details and books of given data.');
        console.log(value);
        var data = JSON.stringify(value);
        fs.writeFile('./bkstr/bkstr_'+storeName+'_'+termId+'_'+depName+'_'+courseName+'_'+J+'.json',data, function (err) {
            if (err) throw err;
            console.log('Saved!');
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
