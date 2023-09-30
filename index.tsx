import { renderToReadableStream } from "react-dom/server";
import Rentap from "./rentap"

//const base64icon: string ="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";
const iconfile = Bun.file("icon.txt");
const base64icon = await iconfile.text();
const aps = [new FormData()];

const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);

    // render rentap.tsx for root path
    if (url.pathname === "/") {
      const stream = await renderToReadableStream(<Rentap icon={base64icon}/>);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });

    }

    // push formdata at /save into file store.json
    if (url.pathname === "/save") {
      const ap = await req.formData();
      aps.push(ap);

      await Bun.write("store.json", JSON.stringify(aps));
      return new Response(JSON.stringify(aps));
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
