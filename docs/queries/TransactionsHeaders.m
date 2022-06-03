/**
 * TransactionsHeaders

 * @since 2022-05-26
 * @author gitgreg@stevens.pro
 */

let
    Source = Transactions,
    Cols = Table.ColumnNames(Source),
    #"Converted to Table" = Table.FromList(Cols, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Renamed Columns" = Table.RenameColumns(#"Converted to Table",{{"Column1", "DestHeaderName"}})
in
    #"Renamed Columns"
