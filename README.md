# rentapBun

WARNING: `bun upgrade` from 1.07 to 1.08 is broken and won't run rentapBun. Stay with `bun 1.07` until issue is resolved.

rentapBun is rentap.js done over again using Bun instead of npm. The only dependency besides Bun is `react-dom`, and only for `import { renderToReadableStream } from "react-dom/server"`.

From the beginning with [rentap.js](https://github.com/colinkeenan/rentap.js), I had trouble getting new data actually saved into `store.db`. The data was being stored by the browser in local storage somewhere. I managed to make it work as long as rentap started in the background and stopped with `npm stop` which used socket.io to emit a stop signal. For some reason, by stopping the server that way, data stored in the browser's local storage actually made it's way into store.db. That broke in 2020: socket.io wouldn't emit the stop signal anymore. With that and less critical issues that I never solved, I decided to start over (3 years later). I chose to have as few dependencies as possible so I wouldn't be forced to update just because a vulnerability was found in one of many dependencies. I also decided to store data as JSON instead of sqlite3 because most of my issues seemed to be related to sqlite3.

This project was created using `bun init` in bun v1.0.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime. I chose 100% server-side render (SSR) because I'm not sure Bun has a way to combine client and server-side rendering without using a framework, and the documentation at this point says you miss out on some benefits of Bun by using a framework. This kept the dependencies lower as well. But, ironically, this "React" project is less reactive than the npm version since no javascript runs in the browser. The server processes all javascript and sends a static fully rendered page to the browser. The server knows nothing about what is happening in the browser until a button is clicked or Enter is pressed in an input. Only the server has access to `store.json` and other files in the directory. The browser only has access to the one static page it is currently displaying. It would be nice if making a selection from a drop-down menu would instantly update the page, but loosing that reactive behavior is a small sacrifice for a fast bug-free rentap that actually saves all the data in `store.json` where it can be backed up and used on other machines or browsers.

I've included two files to help convert the sqlite3 data in `store.db` to JSON data in `store.json`: `createStoreTables.bat` and `combineStoreTables.tsx`. After cloning this repo, just copy `store.db` into it and run these commands:

```
./createStoreTables.bat
bun run combineStoreTables.tsx
```
The final result will be `store.json` containing the data from `store.db`. However, some data may be missing or some discarded aps might not be discarded and vise versa due to rentap.js having not properly stored data from the browser's local storage into `store.db` (the issue that rentapBun solves). In addition, some dates may not show up correctly. After conversion, manual edits may be needed to get everything the way it was in rentap.js. To edit what's in `store.json`, just start rentapBun:

```
bun start
```

This will start the server in the background and open the webpage. Stop the server with

```
pkill bun
```

If you don't want the server running in the background, start the server with `bun run back.tsx` and stop with `Ctrl+C`. Open the webpage in the browser yourself.

If anyone but me is actually using rentapBun and would like more explanation about how to use it, please let me know.
