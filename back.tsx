import { renderToReadableStream } from "react-dom/server";
import Rentap from "./rentap"

const iconfile = Bun.file("icon.txt");
const base64icon = await iconfile.text();
const storefile = Bun.file("store.json");
//sJfT short for storeJSONfileText.
const sJfT = storefile.size ? await storefile.text() : "";
const storeArray = sJfT ? JSON.parse(sJfT) : {};
// Setting up aps, headers, trash, deleted using ? : instead of just defining them and then if() to change because would have to use "let" to be able to change them in if()
const aps = sJfT ? storeArray.aps : [{"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""}];
const apFullNames = aps.map((ap:any) => ap.FullName);
let foundFullNames = ["All Names"];
const headers = sJfT ? storeArray.headers : [{"StreetAddress":"","CityStateZip":"","Title":"","Name":""}];
const headerNames = headers.map((header:any) => header.Name);
headerNames[0] = "'Applying for:' Options";
const trash = sJfT ? storeArray.trash : [{"discardedRow":0}];
const deleted = sJfT ? storeArray.deleted : [{"deletedRow":0}];

let apID = 0;

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // render rentap.tsx with blank ap for root path (got here through New link or bun start)
    if (url.pathname === "/") {
      apID = 0;
      const headerID = 0;
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="New" color="red" viewOnly={false}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with current ap for edit path (got here through Edit link)
    if (url.pathname === "/edit") {
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="Edit" color="red" viewOnly={false}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with prev ap for prev path (got here through Prev link)
    if (url.pathname === "/prev") {
      apID>0? apID-- : apID = aps.length-1;
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="View" color="Green" viewOnly={true}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with next ap for next path (got here through Next link)
    if (url.pathname === "/next") {
      apID < aps.length-1 ? apID++ : apID=0;
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="View" color="Green" viewOnly={true}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with search results listed in FullName select, for search path (got here through search submited with Enter)
    if (url.pathname === "/search") {
      const searchSubmit = await req.text();
      const search = searchSubmit.slice(7); // remove "search="
      foundFullNames = ["Search Results"];
      for (const ap of aps) ap.Email && containsSubstring(ap, search) && foundFullNames.push(ap.FullName);
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const headerID = matchHeader(aps[apID].headerName);
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="View" color="Green" viewOnly={true}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with selected ap for select path (got here through selecting a FullName and submitting with Display button)
    if (url.pathname === "/select") {
      const selectSubmit = await req.text();
      const selectedFullName = selectSubmit.slice(7); // remove "select="
      apID = matchFullName(selectedFullName);
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="View" color="Green" viewOnly={true}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

//other paths that need to be completed: /trash /discard /delete /restore /exittrash /editheaders

    // push formdata at /save into file store.json
    if (url.pathname === "/save") {
      const formData = await req.formData();
      const apSave = Object.fromEntries(formData.entries());
      const apSaveIsNew = apIsNew(apSave);
      const apSaveIsEdited = apIsEdited(apSave);
      if (apSaveIsNew) { aps.push(apSave); apID = aps.length -1; }
      if (apSaveIsEdited) aps[apID] = apSave;
      // write to the file if there's something new to write or if the file doesn't exist
      if (apSaveIsNew || apSaveIsEdited || !sJfT) {
        const fAps = formatArray(aps);
        const fHeaders = formatArray(headers);
        const fTrash = formatArray(trash);
        const fDeleted = formatArray(deleted);
        const formattedStore = `\{"aps":${fAps}, "headers":${fHeaders}, "trash":${fTrash}, "deleted":${fDeleted}\}`;
        await Bun.write("./store.json", formattedStore);
      }
      const message = apSaveIsNew || apSaveIsEdited ? "Saved" : "Nothing to save";
      const color = apSaveIsNew || apSaveIsEdited ? "green" : "red";
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) {
        foundFullNames = apFullNames;
        foundFullNames[0] = "All Names";
      }
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={message} color={color} viewOnly={true}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});


function formatArray(arrObj:Array<Object>) {
  // write each array element on it's own line if there's more than one
  const [a0, ...aRest] = arrObj;
  return arrObj.length > 1 ?
  `[${JSON.stringify(a0)},${aRest.map( (a) => "\n" + JSON.stringify(a) )}]\n`
  : JSON.stringify(arrObj) + "\n";
};

function matchHeader(name:string) {
  const headerID = headers.map((h:any) => h.Name).indexOf(name);
  return headerID > 0 ? headerID : 0;
}

function matchFullName(fullName:string) {
  const matchingApID = aps.map((ap:any) => ap.FullName.replaceAll(' ', '+')).indexOf(fullName); //fullName from <select...> has spaces replaced by +
  return matchingApID > 0 ? matchingApID : 0;
}

function containsSubstring(obj:{[key:string]: any}, substring:string) {
  for (const key in obj)
    if (obj[key].toString().includes(substring)) return true;
  return false;
}

function apIsNew(obj:{[key:string]:any}) {
  // if apID is not 0, we are editing an existing ap, not a new one
  if (apID) return false;
  for (const key in obj) {
    if (obj[key].toString() != "" && key!='headerName')
      return true; // there's something to save
    if (key==='headerName' && obj[key]!=headerNames[0])
      return true;
  }
  return false; // even though on a new ap, there was nothing entered
}

function apIsEdited(obj:{[key:string]:any}) {
  // if apID is 0, we are editing an new ap, not an existing one
  if (!apID) return false;
  for (const key in obj) {
    if (obj[key].toString() != aps[apID][key].toString())
      return true; // there's something to save
  }
  return false; // even though on an existing ap, nothing was changed
}

console.log(`Listening on http://localhost:${server.port}`);
