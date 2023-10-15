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
let foundFullNames = ["All Names (not Discarded)"];
const headers = sJfT ? storeArray.headers : [{"StreetAddress":"","CityStateZip":"","Title":"","Name":""}];
const headerNames = headers.map((header:any) => header.Name);
headerNames[0] = "'Applying for:' Options";
const trash = sJfT ? storeArray.trash : [{"discardedRow":0}];
const deleted = sJfT ? storeArray.deleted : [{"deletedRow":0}];
let inTrash = false;
const trashMessage="Viewing Discarded Applications in Trash"

let apID = 0;

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // render rentap.tsx with blank ap for root path (got here through New link or bun start)
    if (url.pathname === "/") {
      apID = 0;
      inTrash = false;
      const headerID = 0;
      populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="New" color="red" viewOnly={false} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with current ap for edit path (got here through Edit link)
    if (url.pathname === "/edit") {
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="Edit" color="red" viewOnly={false} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with prev ap for prev path (got here through Prev link)
    if (url.pathname === "/prev") {
      apID>0? apID-- : apID = aps.length-1;
      //check if apID was deleted or discarded and skip it unless we're in trash then skip it if not discarded
      if (inTrash)
        while (deleted.some((e:any) => e.deletedRow === apID) || !trash.some((e:any) => e.discardedRow === apID))
          apID>0? apID-- : apID = aps.length-1;
      else
        while (deleted.some((e:any) => e.deletedRow === apID) || trash.some((e:any) => e.discardedRow === apID))
          apID>0? apID-- : apID = aps.length-1;

      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={inTrash ? trashMessage : "View"} color={inTrash ? "Red" : "Green"} viewOnly={true} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with next ap for next path (got here through Next link)
    if (url.pathname === "/next") {
      gotoNextID();
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={inTrash ? trashMessage : "View"} color={inTrash ? "Red" : "Green"} viewOnly={true} inTrash={inTrash}
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
      foundFullNames = inTrash ? ["Search Results in Trash"] : ["Search Results (not Discarded)"];
      for (const ap of aps) {
        // containsSubstring seems to change the apID to aps.indexOf(ap), although it's not obvious to me why.
        // So, comparing discardedRow with apID works. But then, why is apID left unchanged after exiting this for loop?
        // Because it's mysterious, I'm not going to compare discardedRow to apID. Instead, comparing to aps.indexOf(ap)
        if (containsSubstring(ap, search) && !deleted.some((e:any) => e.deletedRow === aps.indexOf(ap))) {
          if (trash.some((e:any) => e.discardedRow === aps.indexOf(ap)))
            inTrash && foundFullNames.push(ap.FullName);
          else !inTrash && foundFullNames.push(ap.FullName);
        }
      }
      if (foundFullNames.length === 1) populateAllNames();
      else apID = matchFullName(foundFullNames[1]);
      const headerID = matchHeader(aps[apID].headerName);
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={inTrash ? trashMessage : "View"} color={inTrash ? "Red" : "Green"} viewOnly={true} inTrash={inTrash}
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
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="View" color="Green" viewOnly={true} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/trash") {
      inTrash = true;
      gotoNextID();
      const headerID = matchHeader(aps[apID].headerName);
      populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={trashMessage} color="red" viewOnly={true} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/exittrash") {
      inTrash = false;
      gotoNextID();
      const headerID = matchHeader(aps[apID].headerName);
      populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="View" color="green" viewOnly={true} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/discard") {
      //put apID in trash if not already there
      if (!trash.some((e:any) => e.discardedRow === apID)) {
        trash.push({discardedRow:apID});
        saveAll();
      }
      inTrash = true;
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={trashMessage} color="red" viewOnly={true} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/restore") {
      //remove apID from trash if it's in there
      if (trash.some((e:any) => e.discardedRow === apID)) {
        const trashApIDindex = trash.map((e:any) => e.discardedRow).indexOf(apID);
        trash.splice(trashApIDindex,1);
        saveAll();
      }
      inTrash = false;
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message="Edit" color="red" viewOnly={false} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/delete") {
      //put apID in deleted if not already there and delete the ap
      if (!deleted.some((e:any) => e.deletedRow === apID)) {
        //add to deleted list and remove from trash list
        deleted.push({deletedRow:apID});
        const trashApIDindex = trash.map((e:any) => e.discardedRow).indexOf(apID);
        trash.splice(trashApIDindex,1);
        //delete the information
        aps[apID] = {"FullName":"Deleted apID:" + apID,"SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""};
        saveAll();
      }
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={trashMessage} color="red" viewOnly={true} inTrash={inTrash}
        ap={aps[apID]} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }


//other paths that need to be completed: /editheaders

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
        saveAll();
      }
      const message = apSaveIsNew || apSaveIsEdited ? "Saved" : "Nothing to save";
      const color = apSaveIsNew || apSaveIsEdited ? "green" : "red";
      const headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) populateAllNames();
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
        message={message} color={color} viewOnly={true} inTrash={inTrash}
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
  const matchingApID =
    fullName.includes(' ') ? aps.map((ap:any) => ap.FullName).indexOf(fullName)
    : aps.map((ap:any) => ap.FullName.replaceAll(' ', '+')).indexOf(fullName); //fullName from <select...> has spaces replaced by +
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

function gotoNextID() {
    apID < aps.length-1 ? apID++ : apID=0;
    //check if apID was deleted or discarded and skip it unless we're in trash then skip it if not discarded
    if (inTrash)
      while (deleted.some((e:any) => e.deletedRow === apID) || !trash.some((e:any) => e.discardedRow === apID))
        apID < aps.length-1 ? apID++ : apID=0;
    else
      while (deleted.some((e:any) => e.deletedRow === apID) || trash.some((e:any) => e.discardedRow === apID))
        apID < aps.length-1 ? apID++ : apID=0;
}

async function saveAll() {
  const fAps = formatArray(aps);
  const fHeaders = formatArray(headers);
  const fTrash = formatArray(trash);
  const fDeleted = formatArray(deleted);
  const formattedStore = `\{"aps":${fAps}, "headers":${fHeaders}, "trash":${fTrash}, "deleted":${fDeleted}\}`;
  await Bun.write("./store.json", formattedStore);
}

function populateAllNames() {
  foundFullNames = inTrash ? ["All Discarded Names"] : ["All Names (not Discarded)"];
  for (const ap of aps) {
    if (inTrash && trash.some((e:any) => e.discardedRow === aps.indexOf(ap)))
      foundFullNames.push(ap.FullName);
    else if (!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) && !deleted.some((e:any) => e.deletedRow === aps.indexOf(ap)))
      foundFullNames.push(ap.FullName);
  }
}

console.log(`Listening on http://localhost:${server.port}`);
