ImportSourceHeaderRenamesThatExist
// ImportSource
let
    Source = Excel.CurrentWorkbook(){[Name="ImportSourceTable"]}[Content],
    #"Removed Blank Rows" = Table.SelectRows(Source, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Blank Rows",{{"Date", type date}, {"Description", type text}, {"Transfer", type number}, {"Balance", type number}, {"Column1", type any}, {"Column2", type any}}),
    #"Removed Columns" = Table.RemoveColumns(#"Changed Type",{"Column1", "Column2"})
in
    #"Removed Columns"

// Trx8r_ImportConfigs
let
    Source = Excel.CurrentWorkbook(){[Name="ImportConfigs"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Removed Blank Rows" = Table.SelectRows(#"Promoted Headers", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Blank Rows",{{"configName", type text}, {"fileNamePattern", type text}, {"Note", type text}, {"Date", type any}, {"Description", type text}, {"Category", type text}, {"Amount", type any}, {"Account", type text}, {"Account #", type text}, {"Institution", type any}, {"Month", type any}, {"Week", type any}, {"Check Number", type any}, {"Full Description", type any}, {"Transaction ID", type any}, {"Account ID", type any}, {"Date Added", type any}, {"Column18", type any}})
in
    #"Changed Type"

// Trx8r_CurrentImportConfig
let
    Source = Trx8r_ImportConfigs,
    #"Filtered Rows" = Table.SelectRows(Source, each [configName] = Trx8r_CurrentConfigNameAlias)
in
    #"Filtered Rows"

// Trx8r_CurrentConfigNameAlias
let
    CONFIG_NAME = "001-2022-05-23"
in
    CONFIG_NAME

// Transactions
let
    Source = Excel.CurrentWorkbook(){[Name="Transactions"]}[Content],
    #"Removed Blank Rows" = Table.SelectRows(Source, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Blank Rows",{{"Date", type date}})
in
    #"Changed Type"

// Trx8r_TrxnsCurrentAlias
let
    ImportCurrentTrxns = Transactions
in
    ImportCurrentTrxns

// Trx8r_ImportSourceHeaderRenames
// ImportSourceHeaderRenames

let
    #"Columns from ImportConfig that match Transactions Worksheet" = Table.SelectColumns(
        Trx8r_CurrentImportConfig,
        Table.ColumnNames(Trx8r_TrxnsCurrentAlias),
        MissingField.UseNull
    ),
    #"Demoted Headers" = Table.DemoteHeaders(#"Columns from ImportConfig that match Transactions Worksheet"),
    #"Transposed Table" = Table.Transpose(#"Demoted Headers"),
    #"Filtered Rows" = Table.SelectRows(#"Transposed Table", each [Column2] <> null),
    #"Transposed Table1" = Table.Transpose(#"Filtered Rows"),
    #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table1", [PromoteAllScalars=true]),
    Record = #"Promoted Headers"{0}
in
    Record

// ImportSourceHeaderRenamesThatExist
let
    Source = Table.SelectColumns(ImportSource, Record.FieldValues(Trx8r_ImportSourceHeaderRenames), MissingField.UseNull),
    #"Kept First Rows" = Table.FirstN(Source,1),
    #"Demoted Headers" = Table.DemoteHeaders(#"Kept First Rows"),
    #"Transposed Table" = Table.Transpose(#"Demoted Headers"),
    #"Removed Blank Rows" = Table.SelectRows(#"Transposed Table", each [Column2] <> null),
    #"Transposed Table1" = Table.Transpose(#"Removed Blank Rows"),
    #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table1", [PromoteAllScalars=true]),
    #"Removed Top Rows" = Table.Skip(#"Promoted Headers",1)
in
    #"Removed Top Rows"