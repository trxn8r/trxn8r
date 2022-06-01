/**
 * ImporterTransactionsFinalWithDupes
 * @since 2022-05-26
 * @author gitgreg@stevens.pro
 */
let
    Source =
        Table.NestedJoin(
            Transactions,
            {
                "Date",
                "Description",
                "Amount"
            },
            ImporterFileContentsCombined,
            {
                "Date",
                "Description",
                "Amount"
            },
            "ImporterFileContentsCombined",
            JoinKind.RightOuter
        ),
    #"Expanded ImporterFileContentsCombined" =
        Table.ExpandTableColumn(
            Source,
            "ImporterFileContentsCombined",
            {
                "Date",
                "Description",
                "Transfer",
                "Balance",
                "File.Name",
                "File.Date modified",
                "File.Date created"
            },
            {
                "ImporterFileContentsCombined.Date",
                "ImporterFileContentsCombined.Description",
                "ImporterFileContentsCombined.Transfer",
                "ImporterFileContentsCombined.Balance",
                "ImporterFileContentsCombined.File.Name",
                "ImporterFileContentsCombined.File.Date modified",
                "ImporterFileContentsCombined.File.Date created"
            }
        ),
    #"Grouped Rows" =
        Table.Group(
            #"Expanded ImporterFileContentsCombined",
            {
                "Date",
                "Description",
                "Amount",
                "Account #",
                "ImporterFileContentsCombined.File.Name",
                "ImporterFileContentsCombined.File.Date modified",
                "ImporterFileContentsCombined.File.Date created"
            },
            {
                {
                    "DupeCount",
                    each Table.RowCount(_),
                    Int64.Type
                }
            }
        ),
    #"Sorted Rows" =
        Table.Sort(
            #"Grouped Rows",
            {
                {
                    "DupeCount",
                    Order.Descending
                }
            }
        ),
    #"Reordered Columns" =
        Table.ReorderColumns(
            #"Sorted Rows",
            {
                "DupeCount",
                "Date",
                "Description",
                "Amount",
                "Account #",
                "ImporterFileContentsCombined.File.Name",
                "ImporterFileContentsCombined.File.Date modified",
                "ImporterFileContentsCombined.File.Date created"
            }
        )
in
    #"Reordered Columns"
