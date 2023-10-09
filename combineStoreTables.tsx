const tblfile = Bun.file("store-tables/tbl.json");
const tbl = tblfile.size ? await tblfile.text() : "";
const headersfile = Bun.file("store-tables/headers.json");
const headers = headersfile.size ? await headersfile.text() : "";
const trashfile = Bun.file("store-tables/trash.json");
const trash = trashfile.size? await trashfile.text() : "";
const deletedfile = Bun.file("store-tables/deleted.json");
const deleted = deletedfile.size ? await deletedfile.text() : "";

//put blank ap at aps[0]
const ap = {"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateGuested":"","dateRented":"","headerName":""};
const aps = tbl ? JSON.parse(tbl) : [ap];
if (tbl) aps.unshift(ap);

// write each ap on it's own line if there's more than one ap
const [a0, ...aRest] = aps;
const formattedAps = aps.length > 1 ?
  `[${JSON.stringify(a0)},${aRest.map( (a) => "\n" + JSON.stringify(a) )}]\n`
  : JSON.stringify(aps);

const formattedStore = `\{"aps":${formattedAps}, "headers":${headers}, "trash":${trash}, "deleted":${deleted}\}`;

await Bun.write("./store.json", formattedStore);
