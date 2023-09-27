const aps = [new FormData()];
const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);

    // return index.html for root path
    if (url.pathname === "/")
      return new Response(Bun.file("index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });

    // parse formdata at /action

    if (url.pathname === "/action") {
      const ap = await req.formData();
      aps.push(ap);
      
      await Bun.write("store.json", JSON.stringify(aps));
      return new Response("Success");
    }

    return new Response("Not Found", { status: 404 });
  },
});
