
'use strict';

/*

storeid
campusid
programid
termid
division
department
courseid
section
isbn
title
edition
author
instructor
publishercode
publisher
copyrightyear
bookimage
materialtype
requirementtype
pricerangedisplay
productcatentryid
cmid
mtcid
storenumber
storedisplayname
termname
termnumber
programname
campusname
divisionname
departmentname
coursename
sectionname
schoolname
bookstoreid
created_on
last_updated_on
updated_by


*/
const fs = require('fs');
let rawdata = fs.readFileSync('data3.json');
let cmdata = JSON.parse(rawdata);
var len = cmdata.length;
const csvToJsonData = require("csvtojson");
const jsonToCsvData = require("json2csv").parse;
const fileSys = require("fs");
csvToJsonData().fromFile("./bnck.csv").then(source => {


  cmdata.forEach(function(index,i){
		let storeid 			= cmdata[i]['storeId']??'';
		let storenumber 		= cmdata[i]['storeNumber']??'';

		foreach courseSectionDTO()
			let campusid			= cmdata[i]['courseSectionDTO'][j]['campusId']??'';
			let programid			= cmdata[i]['courseSectionDTO'][j]['programId']??''; 
			let termid				= cmdata[i]['courseSectionDTO'][j]['termId']??''; 
			let division			= cmdata[i]['courseSectionDTO'][j]['division']??'';    	
			let department			= cmdata[i]['courseSectionDTO'][j]['department']??''; 
			let courseId			= cmdata[i]['courseSectionDTO'][j]['courseId']??''; 
			let section
			let storedisplayname
			let termname
			let termnumber
			let programname
			let campusname
			let divisionname
			let departmentname
			let coursename
			let sectionname
			let schoolname
			let bookstoreid
			foreach courseMaterialResultsList()
				let isbn			= cmdata[i]['courseSectionDTO'][j]['courseMaterialResultsList'][k]['isbn']??'';
				let title
				let edition
				let author
				let instructor
				let publishercode
				let publisher
				let copyrightyear
				let bookimage
				let materialtype
				let requirementtype
				let pricerangedisplay
				let productcatentryid
				let cmid
				let mtcid
			}
		}


    let url = courseMaterial[val]["url"];
    let school = courseMaterial[val]["school"];
    let term = courseMaterial[val]["term"];
    let department = courseMaterial[val]["department"];
    let course = courseMaterial[val]["course"];
    let book = courseMaterial[val]["book"];
    let author = courseMaterial[val]["Author: "];
    let edition = courseMaterial[val]["Edition/Copyright: "];
    let publisher = courseMaterial[val]["Publisher: "];
    let isbn_13 = courseMaterial[val]["ISBN-13: "];
    let isbn_10 = courseMaterial[val]["ISBN-10: "];
    let bookImg = courseMaterial[val]["bookImg"];
    let is_req = courseMaterial[val]["required"];
    let price = courseMaterial[val]["price"];


    source.push({
      "URL":url,
      "school":school,
      "Term":term,
      "Department":department,
      "Course":course,
      "book":book,
      "author":author,
      "editon":edition,
      "publisher":publisher,
      "ISBN-13":isbn_13,
      "ISBN-10":isbn_10,
      "image link":bookImg,
      "is_required":is_req,
      "price":price
	});


    // console.log(url,school,term,department,course,book,author,edittion,publisher,isbn_13,isbn_10,bookImg,is_req,price);
  })
    const csv = jsonToCsvData(source,{fields:["URL","school","Term","Department","Course","book","author","editon","publisher","ISBN-13","ISBN-10","image link","is_required","price"]});
    fileSys.writeFileSync("./bnck.csv",csv);
});

function getBlankRow()
{
	return {
		"section":"",
		"isbn":"",
		"title":"",
		"edition":"",
		"author":"",
		"instructor":"",
		"publishercode":"",
		"publisher":"",
		"copyrightyear":"",
		"bookimage":"",
		"materialtype":"",
		"requirementtype":"",
		"pricerangedisplay":"",
		"productcatentryid":"",
		"cmid":"",
		"mtcid":"",
		"storenumber":"",
		"storedisplayname":"",
		"termname":"",
		"termnumber":"",
		"programname":"",
		"campusname":"",
		"divisionname":"",
		"departmentname":"",
		"coursename":"",
		"sectionname":"",
		"schoolname":"",
		"bookstoreid":"",
		"created_on":"",
		"last_updated_on":"",
		"updated_by":""
	}
}
/*

[{
	"parentStoreId": "123904",
	"storeId": 123904,
	"storeNumber": "1148",
	"storeDisplayName": "Anna Maria College Bookstore",
	"langId": "-1",
	"locale": "en_US",
	"currency": "USD",
	"requirementTypeLabelMap": {
		"RQ": "Required Material(s)",
		"CH": "Choose - Please select from the following...",
		"RM": "Recommended Material(s)",
		"BR": "Suggested by the Bookstore"
	},
	"materialTypeKeyList": ["TXT", "CEB", "SUP"],
	"isViewByLocation": false,
	"isISBNVisible": true,
	"isHEOACheckAvailabilityLink": true,
	"isSuperSite": false,
	"isEbookStore": true,
	"isShowRental": true,
	"isShowNationalRental": false,
	"isSharedinventory": false,
	"isCourseTrackStore": true,
	"isCourseMaterialPreselected": true,
	"isStoreIncludEDAllStudents": true,
	"isDigitalFeeEnabledStore": true,
	"CRNSearchLevel": "NONE",
	"courseLabel": "Course",
	"sectionLabel": "Section",
	"homePageURL": "/Home/11077-123904-1?demoKey=d",
	"searchLimit": 0,
	"DDCSBrowseRetentionLevel": "TERM",
	"accordionControl": "ALL_CLOSED",
	"ddcsNotesControl": "NOTES_CLOSED",
	"digitalSurChargeFee": "3.99",
	"summaryProfile": false

	"courseSectionDTO": [{
		"courseSectionStatus": {
			"status": "SUCCESS",
			"code": "0"
		},
		"termId": "100071295",
		"termName": "Fall 2021",
		"termNumber": "2021FA",
		"termStatus": "A",
		"termOpen": true,
		"rentalReturnDate": {
			"year": 2021,
			"month": 11,
			"dayOfMonth": 20,
			"hourOfDay": 0,
			"minute": 0,
			"second": 0
		},
		"programId": "2558",
		"programName": "Undergraduate/Graduate",
		"campusId": "2124",
		"campusName": "Anna Maria College",
		"institutionName": "Anna Maria College",
		"ddcsBreadCrumb": "Undergraduate/Graduate : Fall 2021 : THE : 318 : 1",
		"adoptionStatus": "500",
		"division": "",
		"divisionName": " ",
		"divisionDescriptorCode": "",
		"department": "THE",
		"departmentName": "THE",
		"departmentDescriptorCode": "THE",
		"course": "318",
		"courseName": "318",
		"courseDescriptorCode": "318",
		"section": "1",
		"sectionName": "1",
		"sectionDescriptorCode": "1",
		"courseId": "81528239",
		"displayFlag": true,
		"salesTrack": "B",
		"courseMinimum": 0,
		"includEdDTO": {
			"isStoreIncludEDAllStudents": true,
			"isIncludEDCampus": false,
			"isIncludEDSection": false,
			"isIncludEDTitle": false
		},
		"instructor": "MESSENGER",
		
		"courseMaterialResultsList": [{
			"rank": 16,
			"cmId": "8152823958461776",
			"mtcId": "9957113",
			"bookImage": "//bkstr.scene7.com/is/image/Bkstr/9781934217856",
			"title": "Theology of the Body for Beginners",
			"edition": "N/A",
			"author": "West",
			"isbn": "9781934217856",
			"materialType": "TXT",
			"requirementType": "RQ",
			"isbnDisplay": "9781934217856",
			"isPackage": false,
			"priceNewLabel": "FLNew",
			"priceUsedLabel": "FLUsed",
			"newBook": "N",
			"productCatentryId": "58461776",
			"productPartNumber": "c6a8b1ea-6649-47d8-8448-e1ad44e90919",
			"publisherCode": "ASCEN",
			"publisherShortName": "ASCEN",
			"copyRightYear": "2009",
			"publisher": "Ascension Press",
			"messageBookType": 0,
			"preSelected": false,
			"priceRangeDisplay": "$8.44 to $12.99",
			"printItemDTOs": {
				"RENTAL_NEW": {
					"typeCondition": "RENTAL_NEW",
					"priceDisplay": "$8.44",
					"itemCatentryId": "70476499",
					"inventoryStatusDB": "IN_STOCK",
					"inventoryStatusBus": "IN_STOCK",
					"inventoryStatusKey": "INV_IN_STOCK_LABEL",
					"binding": "PAPERBACK",
					"preselected": true,
					"mfPartnumber": "012842372",
					"priceNumeric": 8.44,
					"availabilityDate": "",
					"nonRentalBreakageCharge": "$7.63",
					"nonRentalRestockingFee": "$0.97",
					"skuPartNumber": "c6a8b1ea-6649-47d8-8448-e1ad44e90919-rn",
					"nonRentalChargesTotal": "$8.60"
				},
				"BUY_NEW": {
					"typeCondition": "BUY_NEW",
					"priceDisplay": "$12.99",
					"itemCatentryId": "58461777",
					"inventoryStatusDB": "IN_STOCK",
					"inventoryStatusBus": "IN_STOCK",
					"inventoryStatusKey": "INV_IN_STOCK_LABEL",
					"binding": "PAPERBACK",
					"preselected": false,
					"priceNumeric": 12.99,
					"availabilityDate": "",
					"skuPartNumber": "c6a8b1ea-6649-47d8-8448-e1ad44e90919-n",
					"nonRentalChargesTotal": "$0.00"
				}
			},
			"includEDMaterialFlag": false,
			"titleSelectionDisabled": false
		}, {
			"rank": 16,
			"cmId": "8152823973114579",
			"mtcId": "23036769",
			"bookImage": "//bkstr.scene7.com/is/image/Bkstr/9781586177706",
			"title": "Ignatius Bible (RSV) Catholic Edition",
			"edition": "N/A",
			"author": "Bible",
			"isbn": "9781586177706",
			"materialType": "TXT",
			"requirementType": "RQ",
			"isbnDisplay": "9781586177706",
			"isPackage": false,
			"priceNewLabel": "FLNew",
			"priceUsedLabel": "FLUsed",
			"newBook": "N",
			"productCatentryId": "73114579",
			"productPartNumber": "19e3c5df-9615-4522-a4cd-f24b5acf17d2",
			"publisherCode": "IGNAS",
			"publisherShortName": "IGNAS",
			"copyRightYear": "2014",
			"publisher": "Ignatius Press",
			"inventoryStatusKeyGeneral": "INV_OUT_OF_STOCK_LABEL",
			"messageBookType": 0,
			"preSelected": false,
			"priceRangeDisplay": "$17.95",
			"printItemDTOs": {
				"BUY_NEW": {
					"typeCondition": "BUY_NEW",
					"priceDisplay": "$17.95",
					"itemCatentryId": "73114580",
					"inventoryStatusDB": "OUT_OF_STOCK",
					"inventoryStatusBus": "OUT_OF_STOCK",
					"inventoryStatusKey": "INV_OUT_OF_STOCK_LABEL",
					"binding": "PAPERBACK",
					"preselected": false,
					"priceNumeric": 17.95,
					"availabilityDate": "",
					"skuPartNumber": "19e3c5df-9615-4522-a4cd-f24b5acf17d2-n",
					"nonRentalChargesTotal": "$0.00"
				}
			},
			"includEDMaterialFlag": false,
			"titleSelectionDisabled": false
		}],
	"statusDTO": {
		"status": "SUCCESS",
		"code": "0"
	},
	
}]*/