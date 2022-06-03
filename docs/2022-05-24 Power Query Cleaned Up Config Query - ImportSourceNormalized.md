



## OLD




```
// ImportSourceNormalized
let
    CONFIG_NAME = "001-2022-05-23",
    CONFIG_ROW = Table.SelectRows(ImportConfigs, each [configName] = CONFIG_NAME){0},
    Source = ImportSource,
    #"Renamed Columns" = Table.RenameColumns(Source,{CurrentImportConfig[Amount], "Amount"})
in
    #"Renamed Columns"


// https://docs.microsoft.com/en-us/powerquery-m/table-selectrows
```