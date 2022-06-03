// TransactionsAfterImportDistinct

let
    Source = Table.Combine({
        Table.AddColumn(Transactions, "IsFromImport", each 0, type binary),
        Table.AddColumn(ImportSourceNormalized, "IsFromImport", each 1, type binary)
    }),
    #"Changed Type" = Table.TransformColumnTypes(Source,{{"Amount", Currency.Type}}),
    #"Replaced Value" = Table.ReplaceValue(#"Changed Type","",
        // "createSlug(
        //     [Date],
        //     _[Amount],
        //     _[Description]
        // )",
        "asdf",
        Replacer.ReplaceValue, {"slug"}
    ),
    #"Renamed Columns" = Table.RenameColumns(#"Replaced Value",{{"slug", "originalSlug"}}),
    CreateSlugIfNull = Table.AddColumn(#"Renamed Columns", "slug", each if ([originalSlug] = null) then createSlug([Date], [Amount], [Description]) else [originalSlug]),
    #"Removed Columns" = Table.RemoveColumns(CreateSlugIfNull,{"originalSlug"}),
    #"Reordered Columns" = Table.ReorderColumns(#"Removed Columns",{"slug", "Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Month", "Week", "Check Number", "Full Description", "Transaction ID", "Account ID", "Date Added", "IsFromImport", "Balance"}),
    // #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"Description", "Date", "Amount"}),
    #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"slug"})
in
#"Removed Duplicates"




// ----


let
    Source = Table.NestedJoin(Transactions, {"Date", "Description", "Amount"}, ImporterFileContentsCombined, {"Date", "Description", "Transfer"}, "ImporterFileContentsCombined", JoinKind.RightOuter),
    #"Expanded ImporterFileContentsCombined" = Table.ExpandTableColumn(Source, "ImporterFileContentsCombined", {"Date", "Description", "Transfer", "Balance", "File.Name", "File.Date modified", "File.Date created"}, {"ImporterFileContentsCombined.Date", "ImporterFileContentsCombined.Description", "ImporterFileContentsCombined.Transfer", "ImporterFileContentsCombined.Balance", "ImporterFileContentsCombined.File.Name", "ImporterFileContentsCombined.File.Date modified", "ImporterFileContentsCombined.File.Date created"}),
    #"Grouped Rows" = Table.Group(#"Expanded ImporterFileContentsCombined", {"Date", "Description", "Amount", "Account #", "ImporterFileContentsCombined.File.Name", "ImporterFileContentsCombined.File.Date modified", "ImporterFileContentsCombined.File.Date created"}, {{"Count", each Table.RowCount(_), Int64.Type}}),
    #"Sorted Rows" = Table.Sort(#"Grouped Rows",{{"Count", Order.Descending}}),
    #"Reordered Columns" = Table.ReorderColumns(#"Sorted Rows",{"Count", "Date", "Description", "Amount", "Account #", "ImporterFileContentsCombined.File.Name", "ImporterFileContentsCombined.File.Date modified", "ImporterFileContentsCombined.File.Date created"})
in
    #"Reordered Columns"
