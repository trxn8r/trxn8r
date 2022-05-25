// ImporterFileContentsCombined
let
    Source = ImporterFiles,
    #"Filtered Hidden Files1" =
        Table.SelectRows(
            Source,
            each [Attributes]?[Hidden]? <> true
        ),
    #"Load File Contents by Invoking Transform File" =
        Table.AddColumn(
            #"Filtered Hidden Files1",
            "Transform File",
            each #"Transform File"([Content])
        ),
    #"Renamed File Columns" =
        Table.RenameColumns(
            #"Load File Contents by Invoking Transform File",
            {
                {
                    "Name",
                    "File.Name"
                },
                {
                    "Date modified",
                    "File.Date modified"
                },
                {
                    "Date created",
                    "File.Date created"
                }
            }
        ),
    #"Removed Other Columns from File" =
        Table.SelectColumns(
            #"Renamed File Columns",
            {
                "File.Name",
                "File.Date modified",
                "File.Date created",
                "Transform File"
            }
        ),
    #"Expanded File Contents" =
        Table.ExpandTableColumn(
            #"Removed Other Columns from File",
            "Transform File",
            Table.ColumnNames(#"Transform File"(#"Sample File"))
        ),
    #"Changed Type" =
        Table.TransformColumnTypes(
            #"Expanded File Contents",
            {
                {
                    "File.Name",
                    type text
                },
                {
                    "Date",
                    type date
                // todo: Should this be a DateTime?
                },
                {
                    "Description",
                    type text
                },
                {
                    "Transfer",
                    Currency.Type
                },
                {
                    "Balance",
                    Currency.Type
                }
            }
        ),
    #"Reordered Columns" =
        Table.ReorderColumns(
            #"Changed Type",
            {
                "Date",
                "Description",
                "Transfer",
                "Balance",
                "File.Name",
                "File.Date modified",
                "File.Date created"
            }
        )
in
    #"Reordered Columns"