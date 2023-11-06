import { renderToReadableStream } from "react-dom/server";
import { Rentap, EditHeaders } from "./rentap"

const iconfile = Bun.file("icon.txt");
const base64icon = await iconfile.text();
const storefile = Bun.file("store.json");
//sJfT short for storeJSONfileText.
const sJfT = storefile.size ? await storefile.text() : "";
const storeArray = sJfT ? JSON.parse(sJfT) : {};
// Setting up aps, headers, trash, deleted using ? : instead of just defining them and then if() to change because would have to use "let" to be able to change them in if()
const aps = sJfT ? storeArray.aps : [{"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","headerName":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateStart":"","dateStop":"","dateApplied":""}];
const trash = sJfT ? storeArray.trash : [{"discardedRow":0}];
const deleted = sJfT ? storeArray.deleted : [{"deletedRow":0}];
const trashMessage="Viewing Discarded Applications in Trash"
let apHasUndefined = false;
let sort = false;

// const variables needed for <EditHeaders .../> are:
//   icon={base64icon} (defined above) and
//   headers
const headers = sJfT ? storeArray.headers :
  [{"StreetAddress":"","CityStateZip":"","Title":"","Name":""}];
// let variables needed for <EditHeaders .../> are:
//   messageEditHeaders editOption;
let messageEditHeaders = "";
let editOption = "";

// const variables needed for <Rentap .../> are:
//   icon={base64icon} foundFullNames and
//   headerNames
const headerNames = headers.map((header:any) => header.Name);
const foundFullNames = ["All Names (not Discarded)"];
// let variables needed for <Rentap .../> are:
//   ap={aps[apID]} header={headers[headerID]} and
//   message viewOnly inTrash searchField apID (headerID for header)
let message = "";
let viewOnly = true;
let inTrash = false;
let searchField='selectSearchFields'
let apID = 0;
let headerID = 0;

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // A bunch of path-handlers for the Rentap page follows. After those, the rest are for the
    // Applying for Options page. The const stream = ...renderToReadableStream ...
    // return new Response(stream ...line comes at the end of all these path-handlers.

    switch (url.pathname) {
      case '/':
        message = "New";
        viewOnly = true;
        inTrash = false;
        foundFullNamesUpdate();
        apID = 0;
        headerID = 0;
        break;
      case '/edit':
        message = "Edit";
        viewOnly = false;
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/view':
        message = "View"
        viewOnly = true;
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/selectapplyingfor':
        message = "Edit";
        viewOnly = false;
        const headerSubmit = await req.formData();
        const headerEntries = Object.fromEntries(headerSubmit.entries());
        const headerNameSelected = headerEntries.selectApplyingFor.toString();
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        aps[apID].headerName = headerNameSelected;
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/sort':
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        sort = !sort;
        headerID = matchHeader(aps[apID].headerName);
        foundFullNamesUpdate();
        if (sort) { // sort, but don't include the first "name" (a description of the list)
          const sortedNames = foundFullNames.slice(1).sort()
          const n0 = foundFullNames[0];
          foundFullNames.length = 0;
          foundFullNames.push(n0);
          for (const n of sortedNames) foundFullNames.push(n);
        }
        break;
      case '/go':
        const goSubmit = await req.formData();
        const goEntry = Object.fromEntries(goSubmit.entries());
        const goID = Number(goEntry.go);
        if ( !isNaN(goID) && (0 < goID) && (goID < aps.length) ) {
          apID = goID;
          inTrash = trash.some((e:any) => e.discardedRow === goID);
          message = inTrash ? trashMessage : "View";
          viewOnly = true;
          headerID = matchHeader(aps[apID].headerName);
          foundFullNamesUpdate();
        } else message = "Enter a valid apID";
        break;
      case '/prev':
        gotoPrevID();
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/next':
        gotoNextID();
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/current': // search for existing dateStart without dateStop (should return all aps with agreements that have not terminated)
        foundFullNames.length = 0;
        foundFullNames.push(inTrash ? "Search Results in Trash" : "Search Results (not Discarded)");
        for (const ap of aps) {
          if (!deleted.some((e:any) => e.deletedRow === aps.indexOf(ap))) { // nothing to search for in deleted aps
            if (inTrash) { // searching in trash (shouldn't have current agreements in trash, but maybe there by mistake)
              if(trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is in trash
              && ap["dateStart"] && !ap["dateStop"]) {
                foundFullNames.push(ap.FullName);
              }
            } else { // searching aps not in trash
              if(!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is not in trash
              && ap["dateStart"] && !ap["dateStop"]) {
                foundFullNames.push(ap.FullName);
              }
            }
          }
        }
        if (foundFullNames.length === 1) foundFullNamesUpdate(); // nothing found even though search completed, just show all
        else apID = matchFullName(foundFullNames[1]);
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/search':
        const searchSubmit = await req.formData();
        const searchEntries = Object.fromEntries(searchSubmit.entries());
        const search = searchEntries.search.toString();
        searchField = searchEntries.searchFields.toString();
        foundFullNames.length = 0;
        foundFullNames.push(inTrash ? "Search Results in Trash" : "Search Results (not Discarded)");
        if (search) { // no need to search if the search string is empty
          for (const ap of aps) {
            if (!deleted.some((e:any) => e.deletedRow === aps.indexOf(ap))) { // nothing to search for in deleted aps
              if (inTrash) { // searching in trash
                if(trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is in trash
                && containsSubstring(searchField==='selectSearchFields' ? ap : {searchField:ap[searchField]}, search)) {
                  foundFullNames.push(ap.FullName);
                }
              } else { // searching aps not in trash
                if(!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is not in trash
                && containsSubstring(searchField==='selectSearchFields' ? ap : {searchField:ap[searchField]}, search)) {
                  foundFullNames.push(ap.FullName);
                }
              }
            }
          }
        } else { // no search done because search string was empty
          foundFullNamesUpdate(); // just show all
          searchField='selectSearchFields';
        }
        if (foundFullNames.length === 1) foundFullNamesUpdate(); // nothing found even though search completed, just show all
        else apID = matchFullName(foundFullNames[1]);
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/select':
        const selectNameSubmit = await req.formData();
        const selectedFullName = Object.fromEntries(selectNameSubmit.entries());
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        apID = matchFullName(selectedFullName.select.toString());
        headerID = matchHeader(aps[apID].headerName);
        break;
      case '/trash':
        message = trashMessage;
        viewOnly = true;
        inTrash = true;
        gotoNextID();
        headerID = matchHeader(aps[apID].headerName);
        foundFullNamesUpdate();
        break;
      case '/exittrash':
        message = "View";
        viewOnly = true;
        inTrash = false;
        gotoPrevID();
        headerID = matchHeader(aps[apID].headerName);
        foundFullNamesUpdate();
        break;
      case '/discard':
        //put apID in trash if not already there
        if (!trash.some((e:any) => e.discardedRow === apID)) {
          trash.push({discardedRow:apID});
          saveAll();
        }
        message = trashMessage;
        viewOnly = true;
        inTrash = true;
        headerID = matchHeader(aps[apID].headerName);
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        break;
      case '/restore':
        //remove apID from trash if it's in there
        if (trash.some((e:any) => e.discardedRow === apID)) {
          const trashApIDindex = trash.map((e:any) => e.discardedRow).indexOf(apID);
          trash.splice(trashApIDindex,1);
          saveAll();
        }
        message = "Edit";
        viewOnly = false;
        inTrash = false;
        headerID = matchHeader(aps[apID].headerName);
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        break;
      case '/delete':
        //put apID in deleted if not already there and delete the ap
        if (!deleted.some((e:any) => e.deletedRow === apID)) {
          //add to deleted list and remove from trash list
          deleted.push({deletedRow:apID});
          const trashApIDindex = trash.map((e:any) => e.discardedRow).indexOf(apID);
          trash.splice(trashApIDindex,1);
          //delete the information
          aps[apID] = {"FullName":"Deleted apID:" + apID,"SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateStart":"","dateStop":"","headerName":""};
          saveAll();
        }
        message = trashMessage;
        viewOnly = true;
        inTrash = true;
        headerID = matchHeader(aps[apID].headerName);
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        break;
      case '/save':
        message = "Nothing to save";
        const rentapFormData = await req.formData();
        const apSave = Object.fromEntries(rentapFormData.entries());
        if (apIsEdited(apSave)) {
          aps[apID] = apSave;
          saveAll();
          message = apHasUndefined ? "Saved and replaced undefined entries with ''" : "Saved";
        } else if (apIsUnique(apSave) && apIsNew(apSave)) {
          aps.push(apSave);
          apID = aps.length -1;
          saveAll();
          message = "Saved";
        } else if (!apID) { // only display the "already applied" message if user is trying to add a new application (which has to be at apID=0)
          const FullName = apSave.FullName.toString().trim();
          let First = FullName;
          if(First.indexOf(' ')!==-1)
            First = First.substring(0, First.indexOf(' '));
          const AfterFirst = FullName.substring(First.length);
          message = `${apSave.FullName} already applied. Append this new information to that previous application,
                     or use numbers as in: '${First} 1 ${AfterFirst}' & '${First} 2 ${AfterFirst}'`;
        }
        // write to file if doesn't exist already
        if (!sJfT) saveAll();
        viewOnly = true;
        headerID = matchHeader(aps[apID].headerName);
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        break;
      case '/editheaders':
        messageEditHeaders = "Rentap";
        break;
      case '/delheader':
        const delSubmit = await req.formData();
        const delIndex = Object.fromEntries(delSubmit.entries());
        const dI = Number(delIndex.Row);
        if ( !isNaN(dI) && (0 < dI) && (dI < headers.length) &&
          !aps.some((ap:any) => ap.headerName ===headers[dI].Name) )
        {
          const delName = headers[dI].Name;
          headers.splice(dI,1);
          headerNames.splice(dI,1); // keep headerNames in sync with headers
          saveAll();
          messageEditHeaders = "Deleted '" + delName + "' that was on row " + dI;
        } else if ( !(!isNaN(dI) && (0 < dI) && (dI < headers.length)) )
          messageEditHeaders = "Please enter a valid row to be deleted"
        else messageEditHeaders = "Can't delete row " + delIndex + " because '" + headers[dI].Name + "' is in use."
        break;
      case '/editheader':
        messageEditHeaders = 'Rentap';
        const selectHeaderSubmit = await req.formData();
        const selOption = Object.fromEntries(selectHeaderSubmit.entries());
        editOption = selOption.select.toString();
        break;
      case '/saveheader':
        const headerFormData = await req.formData();
        const headerSave = Object.fromEntries(headerFormData.entries());
        const headerRow = headerNames.indexOf(headerSave.Name);
        headers[headerRow] = headerSave;
        saveAll();
        messageEditHeaders = 'Rentap';
        break;
      case '/addheader':
        messageEditHeaders = "Option Added";
        const addHeaderFormData = await req.formData();
        const headerAdd = Object.fromEntries(addHeaderFormData.entries());
        if (headers.some((h:any) => h.Name === headerAdd.Name))
          messageEditHeaders = "Choose a unique name for the new option.";
        else {
          headers.push(headerAdd);
          headerNames.push(headerAdd.Name); // keep headerNames in sync with headers
          saveAll();
        }
        break;
      default:
        return new Response("Not Found", { status: 404 });
    }

    if (url.pathname.includes("header")) {
      const stream =
        await renderToReadableStream(<EditHeaders icon={base64icon}
          headers={headers} message={messageEditHeaders} editOption={editOption}/>);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    } else {
      const stream =
        await renderToReadableStream(<Rentap icon={base64icon}
          message={message} viewOnly={viewOnly} inTrash={inTrash}
          ap={aps[apID]} searchField={searchField} foundFullNames={foundFullNames} apID={apID}
          header={headers[headerID]} headerNames={headerNames} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

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
  const encodedFullNames = aps.map((ap:any) => encodeURI(ap.FullName).replaceAll('%20','+'));
  const matchingApID =
    fullName.includes(' ')
    ? aps.map((ap:any) => ap.FullName).indexOf(fullName)
    : encodedFullNames.indexOf(fullName); //fullName from <select...> is encoded for valid URI, replacing spaces with +
  return matchingApID > 0 ? matchingApID : 0;
}

function containsSubstring(obj:{[key:string]: any}, substring:string) {
  for (const key in obj)
    if (obj[key] && obj[key].toString().includes(substring)) return true;
  return false;
}

function apIsNew(obj:{[key:string]:any}) {
  // if apID is not 0, we are editing an existing ap, not a new one
  if (apID) return false;
  for (const key in obj)
    if (obj[key].toString() != "")
      return true; // there's something to save
  return false; // even though on a new ap, there was nothing entered,
  // (but this should never happen because there are required fields that prevent submission if empty)
}

function apIsEdited(obj:{[key:string]:any}) {
  const isString =  (input:any) => typeof input?.replaceAll === 'function'
  // if apID is 0, we are editing a new ap, not an existing one
  if (!apID) return false;
  for (const key in obj) {
    apHasUndefined = !isString(aps[apID][key]);
    const objKeyIsString = isString(obj[key]);
    if (!objKeyIsString) {
      return false; // don't save undefined
    }
    if (apHasUndefined && objKeyIsString) {
      return true; // yes, replace undefined with something
    }
    if (!apHasUndefined && objKeyIsString) {
      const maybeEdited = obj[key].trim(); // trim to avoid saving extra spaces, but if trying to remove
      const original = aps[apID][key].trim(); // extra spaces, they will have to edit something else too
      if (maybeEdited != original) return true; // there's something to save
    }
  }
  return false; // on an existing ap that was not changed
}

function apIsUnique(obj:{[key:string]:any}) {
  // if obj.FullName is already in aps, it's not unique because every app must have a unique fullName
  return !aps.some((a:any) => a.FullName.toString().trim() === obj.FullName.toString().trim());
}

function gotoPrevID() {
    apID>0? apID-- : apID = aps.length-1;
    //check if apID was deleted or discarded and skip it unless we're in trash then skip it if not discarded
    if (inTrash)
      while (deleted.some((e:any) => e.deletedRow === apID) || !trash.some((e:any) => e.discardedRow === apID))
        apID>0? apID-- : apID = aps.length-1;
    else
      while (deleted.some((e:any) => e.deletedRow === apID) || trash.some((e:any) => e.discardedRow === apID))
        apID>0? apID-- : apID = aps.length-1;
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

function foundFullNamesUpdate() {
  foundFullNames.length = 0;
  foundFullNames.push(sort ?
    inTrash ? "Sorted: All Discarded Names" : "Sorted: All Names (not Discarded)"
    : inTrash ? "All Discarded Names" : "All Names (not Discarded)");
  for (const ap of aps) {
    if (inTrash) {
      if (ap.FullName && trash.some((e:any) => e.discardedRow === aps.indexOf(ap)))
        foundFullNames.push(ap.FullName);
    } else {
      if (!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) && !deleted.some((e:any) => e.deletedRow === aps.indexOf(ap)))
        foundFullNames.push(ap.FullName);
    }
  }
}

console.log(`Listening on http://localhost:${server.port}`);
