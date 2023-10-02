import { renderToReadableStream } from "react-dom/server";
import Rentap from "./rentap"

const iconfile = Bun.file("icon.txt");
const base64icon = await iconfile.text();
const cssfile = Bun.file("./rentap/styles.css");
const css = await cssfile.text();
const aps = [new FormData()];

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // render rentap.tsx for root path
    if (url.pathname === "/") {
      const stream = await renderToReadableStream(<Rentap icon={base64icon} css={css}/>);
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });

    }

    // push formdata at /save into file store.json
    if (url.pathname === "/save") {
      const ap = await req.formData();
      aps.push(ap);

      //putting store.json in ./rentap/ so both back.tsx and front.tsx have access

      await Bun.write("./rentap/store.json", JSON.stringify(aps));
      return new Response(JSON.stringify(aps));
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
