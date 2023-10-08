import { renderToReadableStream } from "react-dom/server";
import Rentap from "./rentap"

const iconfile = Bun.file("icon.txt");
const base64icon = await iconfile.text();
const storefile = Bun.file("store.json");
const storeJSONfileText = storefile.size ? await storefile.text() : "";
const aps = storeJSONfileText ? JSON.parse(storeJSONfileText)
  : [{"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""}];

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // render rentap.tsx for root path
    if (url.pathname === "/") {
      const stream = await renderToReadableStream(<Rentap icon={base64icon} message="New" color="red" ap={aps[0]}/>);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // push formdata at /save into file store.json
    if (url.pathname === "/save") {
      const formData = await req.formData();
      const apNew = Object.fromEntries(formData.entries());
      const apNewIsNew = JSON.stringify(apNew) != JSON.stringify(aps[0]);
      apNewIsNew && aps.push(apNew);
      // write each ap on it's own line if there's more than one ap
      const [a0, ...aRest] = aps;
      const formattedAps = aps.length > 1 ?
        `[${JSON.stringify(a0)},${aRest.map( (a) => "\n" + JSON.stringify(a) )}]`
        : JSON.stringify(aps);
      // write to the file if there's something new to write or if the file doesn't exist
      if (apNewIsNew || !storeJSONfileText) await Bun.write("./store.json", formattedAps);
      const message = apNewIsNew ? "Saved" : "Nothing to save";
      const color = apNewIsNew ? "green" : "red";
      const stream = await renderToReadableStream(<Rentap icon={base64icon} message={message} color={color} ap={apNew}/>);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
