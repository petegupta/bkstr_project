import fetch from "node-fetch";
import ObjectsToCsv from "objects-to-csv";

let fullData = [];
//Enter the following entries according to the google sheet entries of store that uses this return-easy-5 script
let code = 4617067;
let storeName = "unibookstore";
let bookstore_id = 2904;
let storeid = "B00305";

let store_url = `https://www.${storeName}.com/`;

async function fetchData() {
  let school = await getSchool(storeName);
  if (!school) {
    console.log("school Not found");
  } else {
    let schoolLength = school.adoptionSearchParam.Options.length;
    // Enter the school length if script stopped in middle or set this as zero initially
    for (let ss = 0; ss < schoolLength; ss++) {
      let schoolName = school.adoptionSearchParam.Options[ss].name;
      let schoolId = school.adoptionSearchParam.Options[ss].id;
      let terms = await getTerm(schoolId);
      if (!terms) {
        console.log("Term Not found");
      } else {
        let termLength = terms.adoptionSearchParam.Options.length;
        // Enter the term length if script stopped in middle or set this as zero initially
        for (let t = 0; t < termLength; t++) {
          let termName = terms.adoptionSearchParam.Options[t].name;
          let termId = terms.adoptionSearchParam.Options[t].id;
          console.log(termName);
          let departments = await getDepartments(schoolId, termId);
          if (!departments) {
            console.log("No campuses");
          } else {
            let departmentLength =
              departments.adoptionSearchParam.Options.length;
            // Enter the department length if script stopped in middle or set this as zero initially
            for (let d = 0; d < departmentLength; d++) {
              let departmentsId = departments.adoptionSearchParam.Options[d].id;
              let departmentsName =
                departments.adoptionSearchParam.Options[d].name;
              let Courses = await getCourses(departmentsId, schoolId, termId);
              if (!Courses) {
                console.log("No courses");
              } else {
                let courseLenght = Courses.adoptionSearchParam.Options.length;
                // Enter the course length if script stopped in middle or set this as zero initially
                for (let c = 0; c < courseLenght; c++) {
                  let CoursesId = Courses.adoptionSearchParam.Options[c].id;
                  let CoursesName = Courses.adoptionSearchParam.Options[c].name;
                  console.log(CoursesName, CoursesId);
                  let Sections = await getSection(
                    CoursesId,
                    departmentsId,
                    schoolId,
                    termId
                  );
                  if (!Sections) {
                    console.log("No Section Found");
                  } else {
                    let sectionLength =
                      Sections.adoptionSearchParam.Options.length;
                    // Enter the section length if script stopped in middle or set this as zero initially
                    for (let s = 0; s < sectionLength; s++) {
                      //Section.length
                      const sectionId =
                        Sections.adoptionSearchParam.Options[s].id;
                      const sectionName =
                        Sections.adoptionSearchParam.Options[s].name;
                      console.log("section", sectionName, sectionId);
                      let bookdetails = await getBooksDetails(sectionId);
                      if (!(bookdetails[0].items == null)) {
                        for (let b = 0; b < bookdetails[0].items.length; b++) {
                          const priceId = bookdetails[0].items[b].itemId;
                          const bookPrice = await getPrice(priceId);
                          fullData.push({
                            bookrow_id: "",
                            bookstoreid: bookstore_id,
                            storeid: storeid,
                            storenumber: "",
                            storedisplayname: bookdetails[0].school,
                            termid: termId,
                            termname: termName,
                            termnumber: "",
                            programid: "",
                            programname: "",
                            campusid: "",
                            campusname: "",
                            department: "",
                            departmentname: departmentsName,
                            division: "",
                            divisionname: "",
                            courseid: "",
                            coursename: CoursesName,
                            section: sectionId,
                            sectionname: sectionName,
                            instructor: "",
                            schoolname: bookdetails[0].school,
                            cmid: "",
                            mtcid: "",
                            bookimage: bookdetails[0].items[b].image,
                            title: bookdetails[0].items[b].longTitle,
                            edition: bookdetails[0].items[b].bookEdition,
                            author: bookdetails[0].items[b].bookAuthor,
                            isbn: bookdetails[0].items[b].isbn,
                            materialtype: "",
                            requirementtype:
                              bookdetails[0].items[b].courseMaterialRequirement,
                            publisher: bookdetails[0].items[b].publisher,
                            publishercode: "",
                            publisherDate: " ",
                            productcatentryid: "",
                            copyrightyear:
                              bookdetails[0].items[b].copyrightDate,
                            pricerangedisplay: bookPrice,
                            booklink: "",
                            store_url: store_url,
                            user_guid: "",
                            course_codes: "",
                            created_on: dateTime,
                            last_updated_on: dateTime,
                          });
                          console.log(
                            '"Found"',
                            storeName,
                            storeid,
                            schoolName,
                            ss,
                            termName,
                            t,
                            "Depart " + departmentsName,
                            d,
                            "Course " + CoursesName,
                            c,
                            "section " + sectionName,
                            s,
                            b
                          );
                        }
                      } else {
                        fullData.push({
                          bookrow_id: "",
                          bookstoreid: bookstore_id,
                          storeid: storeid,
                          storenumber: "",
                          storedisplayname: bookdetails[0].school,
                          termid: termId,
                          termname: termName,
                          termnumber: "",
                          programid: "",
                          programname: "",
                          campusid: "",
                          campusname: "",
                          department: "",
                          departmentname: departmentsName,
                          division: "",
                          divisionname: "",
                          courseid: "",
                          coursename: CoursesName,
                          section: sectionId,
                          sectionname: sectionName,
                          instructor: "",
                          schoolname: bookdetails[0].school,
                          cmid: "",
                          mtcid: "",
                          bookimage: "",
                          title: "",
                          edition: "",
                          author: "",
                          isbn: "",
                          materialtype: "",
                          requirementtype: "",
                          publisher: "",
                          publishercode: "",
                          publisherDate: "",
                          productcatentryid: "",
                          copyrightyear: "",
                          pricerangedisplay: "",
                          booklink: "",
                          store_url: store_url,
                          user_guid: "",
                          course_codes: "",
                          created_on: dateTime,
                          last_updated_on: dateTime,
                        });
                        console.log(
                          '"Not Found"',
                          storeName,
                          storeid,
                          schoolName,
                          ss,
                          termName,
                          t,
                          "Depart " + departmentsName,
                          d,
                          "Course " + CoursesName,
                          c,
                          "section " + sectionName,
                          s
                        );
                      }
                    }
                  }
                  CsvWriter(fullData);
                  fullData = [];
                }
              }
            }
          }
        }
      }
    }
  }
}

fetchData();

async function CsvWriter() {
  const csv = new ObjectsToCsv(fullData);
  console.log("CSV Creating...");
  await csv
    .toDisk(`../adoption_search_data/adoption_search_${storeName}_.csv`, {
      append: true,
    })
    .then(console.log("Succesfully Data save into CSV"));
}

async function getPrice(priceId) {
  let res = "";
  let price;
  try {
    let str = await fetch(
      `https://www.${storeName}.com/api/items?c=${code}&country=US&currency=USD&facet.exclude=custitem_ns_sc_ext_only_pdp%2Ccustitem_ns_sc_ext_gift_cert_group_id%2Citemtype&fieldset=search&id=${priceId}&include=facets&language=en&n=2&pricelevel=5&use_pcv=F`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.json();
  } catch (error) {
    console.log("Books Details API", error);
  }
  if (res.errors == "URL not found" || res.code == 404) {
    price = "";
  } else {
    let bookPrice = res;
    let priceMin =
      bookPrice.facets[bookPrice.facets.length - 1].min == undefined
        ? " "
        : bookPrice.facets[bookPrice.facets.length - 1].min;
    let priceMax =
      bookPrice.facets[bookPrice.facets.length - 1].max == undefined
        ? " "
        : bookPrice.facets[bookPrice.facets.length - 1].max;
    price = priceMin == priceMax ? `$${priceMax}` : `$${priceMin}-${priceMax}`;
  }
  return price;
}

async function getBooksDetails(sectionId) {
  let res = "";
  try {
    let str = await fetch(
      `https://www.${storeName}.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&ccId=${sectionId}&n=2&searchAdoptions=true`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.json();
  } catch (error) {
    console.log("Books Details API", error);
  }
  return res;
}

async function getSection(courseId, departmentId, schoolId, termId) {
  let res = "";
  try {
    let str = await fetch(
      //https://www.unibookstore.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=4617067&n=2&searchAdoptionParameters=true
      `https://www.${storeName}.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=${courseId}&department=${departmentId}&isAllowed=true&n=2&school=${schoolId}&searchAdoptionParameters=true&term=${termId}`
    );
    res = await str.json();
  } catch (error) {
    console.log("Course API", error);
  }

  return res;
}

async function getCourses(departmentId, schoolId, termId) {
  let res = "";
  try {
    let str = await fetch(
      `https://www.${storeName}.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=&department=${departmentId}&isAllowed=true&n=2&school=${schoolId}&searchAdoptionParameters=true&term=${termId}`
    );
    res = await str.json();
  } catch (error) {
    console.log("Department API", error);
  }
  return res;
}

async function getDepartments(schoolId, termId) {
  let res = "";
  try {
    let str = await fetch(
      `https://www.${storeName}.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=&department=&isAllowed=true&n=2&school=${schoolId}&searchAdoptionParameters=true&term=${termId}`
    );
    res = await str.json();
  } catch (error) {
    console.log("campus API", error);
  }

  return res;
}

async function getTerm(schoolId) {
  let res = "";
  try {
    let str = await fetch(
      `https://www.${storeName}.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=&department=&isAllowed=true&n=2&school=${schoolId}&searchAdoptionParameters=true&term=`
    );
    res = await str.json();
  } catch (error) {
    console.log("Term API", error);
  }

  return res;
}

//
async function getSchool(storeName) {
  let res = "";
  try {
    let str = await fetch(
      `https://www.${storeName}.com/scs/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&n=3&searchAdoptionParameters=true`
    );
    res = await str.json();
  } catch (error) {
    console.log("School API", error);
  }
  return res;
}

const headers = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US, en; q=0.9",
  "Content-Type": "text/html; charset=utf-8",
  Connection: "keep-alive",
  gzip: true,
};

let today = new Date();
let date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;
