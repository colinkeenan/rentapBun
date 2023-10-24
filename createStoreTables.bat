mkdir -p store-tables
sqlite3 store.db '.mode json' '.once store-tables/deleted.json' 'select * from deleted'
sqlite3 store.db '.mode json' '.once store-tables/headers.json' 'select * from headers'
sqlite3 store.db '.mode json' '.once store-tables/tbl.json' 'select * from tbl'
sqlite3 store.db '.mode json' '.once store-tables/trash.json' 'select * from trash'
