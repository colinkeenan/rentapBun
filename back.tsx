import { renderToReadableStream } from "react-dom/server";
import Rentap from "./rentap"

const iconfile = Bun.file("icon.txt");
const base64icon = await iconfile.text();
const storefile = Bun.file("store.json");
const storeJSONfileText = storefile.size ? await storefile.text() : "";
let aps = [{"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""}];
let headers = [{"StreetAddress":"","CityStateZip":"","Title":"","Name":""}];
let trash = [{"discardedRow":0}];
let deleted = [{"deletedRow":0}];
if (storeJSONfileText) {
  const storeArray = JSON.parse(storeJSONfileText);
  if (storeArray.aps) aps = storeArray.aps;
  if (storeArray.headers) headers = storeArray.headers;
  if (storeArray.trash) trash = storeArray.trash;
  if (storeArray.deleted) deleted = storeArray.deleted;
}

let apID = 0;

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // render rentap.tsx with blank ap for root path (got here through New link or bun start)
    if (url.pathname === "/") {
      apID = 0;
      const stream = await renderToReadableStream(<Rentap icon={base64icon} message="New" color="red" ap={aps[0]} viewOnly={false} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // render rentap.tsx with current ap for edit path (got here through Edit link)
    if (url.pathname === "/edit") {
      const stream = await renderToReadableStream(<Rentap icon={base64icon} message="Edit" color="red" ap={aps[apID]} viewOnly={false} />);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // push formdata at /save into file store.json
    if (url.pathname === "/save") {
      const formData = await req.formData();
      const apSave = Object.fromEntries(formData.entries());
      const apSaveIsNew = !apID && JSON.stringify(apSave) != JSON.stringify(aps[0]);
      const apSaveIsEdited = apID && JSON.stringify(apSave) != JSON.stringify(aps[apID]);
      if (apSaveIsNew) { aps.push(apSave); apID = aps.length -1; }
      if (apSaveIsEdited) aps[apID] = apSave;
      // write to the file if there's something new to write or if the file doesn't exist
      if (apSaveIsNew || apSaveIsEdited || !storeJSONfileText) {
        const fAps = formatArray(aps);
        const fHeaders = formatArray(headers);
        const fTrash = formatArray(trash);
        const fDeleted = formatArray(deleted);
        const formattedStore = `\{"aps":${fAps}, "headers":${fHeaders}, "trash":${fTrash}, "deleted":${fDeleted}\}`;
        await Bun.write("./store.json", formattedStore);
      }
      const message = apSaveIsNew || apSaveIsEdited ? "Saved" : "Nothing to save";
      const color = apSaveIsNew || apSaveIsEdited ? "green" : "red";
      const stream = await renderToReadableStream(<Rentap icon={base64icon} message={message} color={color} ap={aps[apID]} viewOnly={true} />);
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

console.log(`Listening on http://localhost:${server.port}`);
