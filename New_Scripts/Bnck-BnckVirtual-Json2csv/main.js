"use strict";
const fs = require("fs");
// Here in line 4 add the name of the file that contains the JSON Data from LocalStorage Manager it will take the data from that file and conver that into csv
// We will get the data in the bnck.csv file
let rawdata = fs.readFileSync("./leftData.json");
let student = JSON.parse(rawdata);
var len = student.length;
const csvToJsonData = require("csvtojson");
const jsonToCsvData = require("json2csv").parse;
const fileSys = require("fs");
csvToJsonData()
  .fromFile("./bnckData.csv")
  .then((source) => {
    student.forEach(function (index, val) {
      var url = student[val]["url"];
      var school = student[val]["school"];
      var term = student[val]["term"];
      var department = student[val]["department"];
      var course = student[val]["course"];
      var book = student[val]["book"];
      var author = student[val]["Author: "];
      var edition = student[val]["Edition/Copyright: "];
      var publisher = student[val]["Publisher: "];
      var isbn_13 = student[val]["ISBN-13: "];
      var isbn_10 = student[val]["ISBN-10: "];
      var bookImg = student[val]["bookImg"];
      var is_req = student[val]["required"];
      var price = student[val]["price"];
      source.push({
        URL: url,
        school: school,
        Term: term,
        Department: department,
        Course: course,
        book: book,
        author: author,
        editon: edition,
        publisher: publisher,
        "ISBN-13": isbn_13,
        "ISBN-10": isbn_10,
        "image link": bookImg,
        is_required: is_req,
        price: price,
      });
      // console.log(url,school,term,department,course,book,author,edittion,publisher,isbn_13,isbn_10,bookImg,is_req,price);
    });
    const csv = jsonToCsvData(source, {
      fields: [
        "URL",
        "school",
        "Term",
        "Department",
        "Course",
        "book",
        "author",
        "editon",
        "publisher",
        "ISBN-13",
        "ISBN-10",
        "image link",
        "is_required",
        "price",
      ],
    });
    fileSys.writeFileSync("./bnck.csv", csv);
  });
