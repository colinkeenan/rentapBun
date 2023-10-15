const tblfile = Bun.file("store-tables/tbl.json");
const tbl = tblfile.size ? await tblfile.text() : "";
const headersfile = Bun.file("store-tables/headers.json");
const oldheaders = headersfile.size ? await headersfile.text() : "";
const trashfile = Bun.file("store-tables/trash.json");
const oldtrash = trashfile.size? await trashfile.text() : "";
const deletedfile = Bun.file("store-tables/deleted.json");
const olddeleted = deletedfile.size ? await deletedfile.text() : "";

//put blank ap at aps[0]
const ap = {"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""};
const aps = tbl ? JSON.parse(tbl) : [ap];

if (tbl) {
  aps.unshift(ap); //put blank ap at aps[0];

  //fix dates to be in format "YYYY-MM-DD" or ""
  for (const ap of aps) {
    ap.BirthDate = fixDatetxt(ap.BirthDate);
    ap.dateApplied = fixDatetxt(ap.dateApplied);
    ap.dateGuested = fixDatetxt(ap.dateGuested);
    ap.dateRented = fixDatetxt(ap.dateRented);
  }

  //convert stuff I entered in date fields to just dates
  function fixDatetxt (datetxt:string) {
    if (!datetxt) return "";
    if (!datetxt.includes('/') && !datetxt.includes('-')) return "";
    const dateArray = datetxt.split( datetxt.includes('/') ? '/' :  '-' );
    const month = !isNaN(Number(dateArray[0])) ? Number(dateArray[0]) -1 : 0;
    const day = !isNaN(Number(dateArray[1])) ? Number(dateArray[1]) : 1;
    //year is trouble because I added a lot of text to some dates
    const year = fixYear(dateArray[2]);
    return year === 9999 ? "" : JSON.stringify(new Date(year,month,day)).substring(1,11); //charAt(0) is "
  }

  function fixYear (sYear:string) {
    if (sYear === undefined) return 9999;
    sYear = sYear.trim();
    const curYear = new Date().getFullYear();
    if ( isNaN( Number(sYear.charAt(2)) ) || isNaN( Number(sYear.charAt(3)) ) ) sYear = sYear.substring(0,2);
    else sYear = sYear.substring(0,4);
    let year = !isNaN(Number(sYear)) ? Number(sYear): 9999;
    // no dates will be in the future
    if (year < 100) {
      if (year < curYear - 2000) year = year + 2000; // 2 digit years should be after 2000
      else if (curYear - 2000 < year) year = year + 1900; // but could be between 100 years ago and 2000
    }
    return year;
  }

}

//put blank header at headers[0]
const header = {"StreetAddress":"","CityStateZip":"","Title":"","Name":""};
const headers = oldheaders ? JSON.parse(oldheaders) : [header];
if (oldheaders) headers.unshift(header);

//insert discardedRow:0 at trash[0]
const aptrash = {"discardedRow":0};
const trash = oldtrash ? JSON.parse(oldtrash) : [aptrash];
if (oldtrash) trash.unshift(aptrash);

//insert deletedRow:0 at deleted[0]
const apdeleted = {"deletedRow":0};
const deleted = olddeleted ? JSON.parse(olddeleted) : [apdeleted];
// Changing null in deleted aps to "" because null generates error.
// Even though inserted blank app at aps[0], don't have to change aps[d+1] because old aps index started at 1
if (olddeleted) for (const d of deleted) aps[d.deletedRow] =
  {"FullName":"Deleted apID:" + d.deletedRow,"SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""};
if (olddeleted) deleted.unshift(apdeleted);

// write each element on it's own line if there's more than one
const formattedAps = formatArray(aps);
const formattedHeaders = formatArray(headers);
const formattedTrash = formatArray(trash);
const formattedDeleted = formatArray(deleted);

const formattedStore = `\{"aps":${formattedAps}, "headers":${formattedHeaders}, "trash":${formattedTrash}, "deleted":${formattedDeleted}\}`;

await Bun.write("./store.json", formattedStore);

function formatArray(arrObj:Array<Object>) {
  // write each array element on it's own line if there's more than one
  const [a0, ...aRest] = arrObj;
  return arrObj.length > 1 ?
  `[${JSON.stringify(a0)},${aRest.map( (a) => "\n" + JSON.stringify(a) )}]\n`
  : JSON.stringify(arrObj) + "\n";
};
