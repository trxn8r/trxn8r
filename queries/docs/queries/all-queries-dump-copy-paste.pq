// t8r_GetWorksheet
/**
 * t8r_GetWorksheetFromT8rWB
 * Created for "t8r_ImportConfigs"
 *
 *
 * @since 2022-0-31
 */
let
    // @version 2022-05-31
    Source = (worksheetName) => let

        /*
        #WARNING: `CurrentWorkbook(...` has a `Content` key,
        while `Excel.Workbook(...` has a `Data` key instead.
        */

        workbook = Excel.CurrentWorkbook(),     // https://docs.microsoft.com/en-us/powerquery-m/excel-currentworkbook
        worksheet = workbook{[Name=worksheetName]},
        content = worksheet[Content],

        //
        FinalStep = content
    in
        FinalStep
in
    Source

// T8R_CONFIG_WORKSHEET
let
    ConfigTable = t8r_GetWorksheet("t8r_ConfigTableRange"),
    #"Promoted Headers" = Table.PromoteHeaders(ConfigTable, [PromoteAllScalars=true]),
    #"SelectRows with Names" = Table.SelectRows(
        #"Promoted Headers",
        each [Name] <> null
    )
    /*
    ,
    // Only grab Name and Value in case other columns change.
    #"Removed Other Columns" = Table.SelectColumns(#"Filtered Rows",{"Name", "Value"})
    */
in
    #"SelectRows with Names"

// t8r_GetConfigValue
let

    // // alias for "Applied Steps" Navigator for easy #debug and #demo
    // T8R_CONFIG_WORKSHEET = T8R_CONFIG_WORKSHEET,
    // T8R_CURRENT_IMPORT_CONFIG = T8R_CURRENT_IMPORT_CONFIG,

    // @version 2022-06-01
    Source = (configName) => let

        /*
*/
        // https://docs.microsoft.com/en-us/powerquery-m/table-selectrows
        SelectedRows = Table.SelectRows(
            T8R_CONFIG_WORKSHEET,
            each [Name] = configName
        ),


        // Cannot do this since it is an alias to values returned from me...
        // ...which means...cyclic reference error ;)
        // SelectedRows = T8R_CURRENT_IMPORT_CONFIG,


        // WARNING: I don't know enough if SingleRow below would be better:
        // SelectedRows{0}[Value]
        // Should besome validation for a null / 0 record result right?
        Row = Table.SingleRow(SelectedRows),
        //FinalStep = Row[Value]
        FinalStep = Row
    in
        FinalStep
in
    Source

// T8R_TRXNS_WORKBOOK_PATH
/**
 * @since 2022-06-01
 */
let
    ConfigValue = t8r_GetConfigValue("T8R_TRXNS_WORKBOOK_FILE")
in
    ConfigValue

// t8r_TrxnsWorkbook
/**
 * Used by [[t8r_GetWorksheetFromTrxnsWorkbook]]
 * @since 2022-06-02
 */
let
    // alias for painless debugging
    T8R_TRXNS_WORKBOOk_PATH = T8R_TRXNS_WORKBOOK_PATH,
    //worksheet = t8r_GetWorksheetFromTrxnsWorkbook(T8R_TRXNS_WORKSHEET_NAME)
    workbook = Excel.Workbook(
        File.Contents(T8R_TRXNS_WORKBOOK_PATH),
        false,
        true
    ),
    worksheet = workbook{[Name=T8R_TRXNS_WORKSHEET_NAME]},

    FinalStep = worksheet
in
    FinalStep

// T8R_TRXNS_WORKSHEET_NAME
/**
 *
 * @since 2022-06-01
 */
let
    ConfigValue = t8r_GetConfigValue("T8R_TRXNS_WORKSHEET_NAME"),
    DefaultOverwrite =
        if (ConfigValue = null)
        then "Transactions"
        else ConfigValue

in
    DefaultOverwrite

// t8r_GetWorksheetFromTrxnsWorkbook
// t8r_GetWorksheetFromMainWB
// @related t8r_GetWorksheetFromT8rWB
let
    Source = (worksheetName) => let
        //Source = Excel.CurrentWorkbook(){[Name="Transactions"]}[Content],
        // Source = Excel.Workbook(File.Contents("W:\src\tiller-challenge-2022\Tiller-Foundation-Template.xlsx"), null, true){[Name="Transactions"]}[Content],
        // Excel.Workbook(binary, useFirstRowAsHeaders, ...)
        //MAIN_FILE_PATH = "W:\src\tiller-challenge-2022\Tiller-Foundation-Template.xlsx",
        // TRANSACTIONS_WORKSHEET_NAME = "Transactions",



        /*
        https://docs.microsoft.com/en-us/powerquery-m/excel-workbook

            Excel.Workbook(
                workbook as binary, optional useHeaders as any, optional delayTypes as nullable logical
            ) as table

        */
        worksheet = t8r_TrxnsWorkbook{[Name=worksheetName]},
        data = worksheet[Data]
    in
        data
in
    Source


    /* ALT, H, Q => ALT then H for Home Tab on Top Ribbon Bar, then Q for `Advanced Editor` #ProTip #Shortcut */

// t8r_SourceBalanceHistory
let
    Source = t8r_GetWorksheetFromTrxnsWorkbook("BalanceHistory"),
    #"Changed Type" = Table.TransformColumnTypes(Source,{{"Date", type datetime}, {"Time", type number}, {"Account", type text}, {"Account #", type text}, {"Institution", type text}, {"Balance", type number}, {"Type", type text}, {"Class", type text}, {"Month", type datetime}, {"Week", type datetime}, {"Balance ID", type text}, {"Account ID", type text}, {"Date Added", type datetime}}),
    #"Removed Blank Rows" = Table.SelectRows(#"Changed Type", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))
in
    #"Removed Blank Rows"

// t8r_Accounts
let
    Source = t8r_SourceBalanceHistory,
    #"Removed Blank Rows" = Table.SelectRows(Source, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Removed Duplicates" = Table.Distinct(#"Removed Blank Rows", {"Date"}),
    #"Sorted Rows" = Table.Sort(#"Removed Duplicates",{{"Account", Order.Ascending}, {"Account #", Order.Ascending}})
in
    #"Sorted Rows"

// t8r_CurrentTrxnsWorksheet
let
    //Source = Excel.CurrentWorkbook(){[Name="Transactions"]}[Content],
    // Source = Excel.Workbook(File.Contents("W:\src\tiller-challenge-2022\Tiller-Foundation-Template.xlsx"), null, true){[Name="Transactions"]}[Content],
    // Excel.Workbook(binary, useFirstRowAsHeaders, ...)
    // Source = Excel.Workbook(File.Contents("W:\src\tiller-challenge-2022\Tiller-Foundation-Template.xlsx"), true, true){[Name="Transactions"]}[Data],
    Source = t8r_GetWorksheetFromTrxnsWorkbook(T8R_TRXNS_WORKSHEET_NAME),
    #"Removed Blank Rows" = Table.SelectRows(Source, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Blank Rows",{{"Date", type date}})
in
    #"Changed Type"

// T8R_IMPORT_DIR
/**
 *
 * @since 2022-06-01
 */
let
    ConfigValue = t8r_GetConfigValue("T8R_IMPORT_DIR")
in
    ConfigValue

// t8r_ImportFiles
/**
 * FilesToImport
 *
 * @since 2022-05-20
 */
let
    // Alias Paramaters for for easy dumping through PQ Steps Editor
    dirPath = T8R_IMPORT_DIR,
    // fileNamePattern = T8R_CURRENT_IMPORT_CONFIG[fileNamePattern],
    fileNamePattern = t8r_GetConfigValue("fileNamePattern"),

    // List all Files
    Source = Folder.Files(dirPath),
    /*
    Filter files to only ones we want.
    Future hoping to parse JSON, Excel, whatever PQ can handle, plus APIs hopefully. Maybe direct Yodlee integration.

    TODO: This should consider `t8r_ImportConfigs` file name pattern.
    */
    #"Filtered Rows for CSV Files Only" = Table.SelectRows(
        Source,
        each (
            Text.Contains([Name], fileNamePattern)
            // [Name] = ".csv"
            // [Extension] = ".csv"
        )
        // T8R_CURRENT_IMPORT_CONFIG[fileNamePattern]
    ),
    // TODO: Custom filter from an ImportConfig
    // #"Filtered Rows1" = Table.SelectRows(#"Filtered Rows", each Text.EndsWith([Name], "Details.csv")),
    #"Added Custom" = Table.AddColumn(
        #"Filtered Rows for CSV Files Only",
        "ShouldImport",
        each true,
        type logical
    )
in
    #"Added Custom"

// t8r_ImportFilesTrxnsCombined
// ImporterFileContentsCombined
let
    Source = t8r_ImportFiles,
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
    #"Removed Blank Rows" = Table.SelectRows(#"Expanded File Contents", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" =
        Table.TransformColumnTypes(
            #"Removed Blank Rows",
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

// Transform File
let
    Source = (#"Transform File SampleFileParam" as binary) => let
        Source = Csv.Document(#"Transform File SampleFileParam",[Delimiter=",", Columns=4, Encoding=1252, QuoteStyle=QuoteStyle.None]),
        #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
    in
        #"Promoted Headers"
in
    Source

// Sample File
let
    Source = t8r_ImportFiles,
    Navigation1 = Source{0}[Content]
in
    Navigation1

// t8r_ImportSourceDataShortcut
let
    // Simple Alias for #future use, such as importing from non-File sources e.g. Web Services.
    Source = t8r_ImportFilesTrxnsCombined
in
    Source

/*
// Source = Excel.CurrentWorkbook(){[Name="ImportSourceTable"]}[Content],
    // Source = GetWorksheetFromFoundation("ImportSourceFile"),

*/

// t8r_ImportSourceRemapped
// ImportSourceNormalized

// #ThankYou for List.Zip and more https://www.youtube.com/watch?v=wSwXyfaXQgU


let
    // "Normalize" as in Rename/remap columns, Re-order, etc..
    // Not quite "Transformed" as that will happen next, but it is close.
    ImportSourceRecords = t8r_ImportSourceDataShortcut,
    ImportSourceHeadersMap = t8r_ImportSourceHeadersMap,
    /* example record could be `Amount = Transfer` */

    //    NewNames = {"Last Week Sales","Two Weeks Ago","Three Weeks Ago"},
    //     Renames = List.Zip({OldNames,NewNames}),
    // Custom2 = Table.RenameColumns(Base,Renames),
    // https://docs.microsoft.com/en-us/powerquery-m/table-selectrows
    Renames = List.Zip({
        Record.FieldValues(ImportSourceHeadersMap),
        Record.FieldNames(ImportSourceHeadersMap)
    }),

    //  Renamed All Columns of ImportSourceAlias to Match t8r_ImportSourceHeadersMap
    RenameColumns = Table.RenameColumns(
        ImportSourceRecords,
        Renames
    ),

    // TODO!: Why are we generating a slug again??
    // Oh, actually better here? Then it is ran again in the later Query that combines NEW and OLD just in case? Well, we don't need slug yet, so do it later!
    #"Add Slug Column and Populate using createTrxn8rSlug" = Table.AddColumn(
        RenameColumns, "slug", each createTrxn8rSlug(
            [Date],
            [Amount],
            [Description]
        )
    ),

    FinalStep = #"Add Slug Column and Populate using createTrxn8rSlug"
in
    FinalStep

// T8R_CONFIGS_RANGE_NAME
"t8r_ImportConfigsTable" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]

// t8r_ImportConfigs
// t8r_IMportCOnfigs
// Source = Excel.CurrentWorkbook(){[Name=T8R_CONFIGS_WS_NAME]}[Content],\
let

    // @version 2022-06-03
    // cyclcic reference with t8r_GetConfig on 2022-06-03
    // Source = t8r_GetWorksheet(T8R_CONFIGS_RANGE_NAME),
    Source = Excel.CurrentWorkbook(){[Name=T8R_CONFIGS_RANGE_NAME]}[Content],
    // table has records in the columns, since there are 80% more values than records #MadeUpStats
    SourceAsTable = Table.Transpose(Source),
    #"Promoted Headers" = Table.PromoteHeaders(SourceAsTable, [PromoteAllScalars=true]),
    #"Removed Blank Rows" = Table.SelectRows(#"Promoted Headers", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))
in
    #"Removed Blank Rows"

// T8R_CONFIG_NAME_TO_USE
/**
 * T8R_IMPORT_CONFIG_NAME_TO_USE
 *
 * Defaults to the first config if the specified one cannot be found.
 *
 * @version 2022-06-02
 * @since   2022-06-01
 */
let
    ImportConfigName = t8r_GetConfigValue("T8R_CONFIG_NAME_TO_USE"),
    // Aliasing here for easy debugging.
    ImportConfigs = t8r_ImportConfigs,
    SelectedConfig = Table.SelectRows(
        ImportConfigs,
        each [configName] = ImportConfigName
    ),
    ConfigValue2 =
        if (Table.RowCount(SelectedConfig) > 0)
        then ImportConfigName
        // Table.First(table as table, optional default as any) as any
        else Table.First(ImportConfigs)[configName]
in
    ConfigValue2

// Default to first config if none is found (TODO: might be bad...?)

/*

*/

// T8R_CURRENT_IMPORT_CONFIG
let
    Source = Table.SelectRows(
        t8r_ImportConfigs,
        each [configName] = T8R_CONFIG_NAME_TO_USE
    )
in
    Source

// t8r_ImportSourceHeadersMap
/**
 * ImportSourceHeaderRenames
 *
 * @version 2022-06-02
 * @since 2022-05-25
 *
If this is broken (warning icon) it means that the Worksheet File or TrxnsWorksheet param is not set/correct.

> Express.Error: The field 'Column2' of the record wasn't found.
> Details:
>    Column1=Date
*/

let
    /*
    params - Helps #debug by using `APPLIED STEPS` in the `Query Settings` sidebar. (I did not know they were called that, but the right sidebar steps). #BestPractice
    */
    t8r_CurrentImportConfig = T8R_CURRENT_IMPORT_CONFIG,
    tempSourceTrxns = t8r_CurrentTrxnsWorksheet,

    /* logic */
    #"Columns from ImportConfig that match Transactions Worksheet" = Table.SelectColumns(
        t8r_CurrentImportConfig,
        Table.ColumnNames(tempSourceTrxns),
        MissingField.UseNull
    ),
    #"Demoted Headers" = Table.DemoteHeaders(#"Columns from ImportConfig that match Transactions Worksheet"),
    #"Transposed Table" = Table.Transpose(#"Demoted Headers"),
    // ???
    #"Filtered Rows" = Table.SelectRows(#"Transposed Table", each [Column2] <> null),
    //
    #"Transposed Table1" = Table.Transpose(#"Filtered Rows"),
    #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table1", [PromoteAllScalars=true]),
    Record = #"Promoted Headers"{0}
in
    Record

// createTrxn8rSlug
let
    CreateSlug = (date, amount, description) => Text.Combine(
        Text.Split(
            Text.Combine({
            Date.ToText(
                date,
                [Format="yyyyMMdd"]
            ),
            Text.Replace(
                Text.Replace(Number.ToText(
                    amount,
                    "F2"
                ), "-", "N"),
                ".",
                "-"
            ),
            Text.Lower(
                Text.Middle(
        //            Text.Remove([Description], "Transfer,from,to, "),
                    Text.Replace(
                        Text.Clean(
                            description
                        ),
                    " ", "-"),
                    0,
                    48
                )
            )
        },
        "-")
    , "-"),
    "-"
)
in CreateSlug

// t8r_TrxnsAfterImportAll
/**
 * t8r_TrxnsAfterAddingSlug
 *
 * Not really params, but the incoming variables.
 * Whoa....
 * TODO: Look at adding a function with params that this calls! 2022-05-31
 *
 * @param   TransactionsWorksheet type table
 * @param   ImportSourceNormalized type table
 *
 * #DevNote Using @version as an @modified despite it generally
 *          being a git/build template variable in most examples.
 *
 * @since   2022-05-25
 * @version 2022-05-31
 * @version =@updated ?
 * @package trxn8r
 *
 */



 // TODO: Add Build Process, then Template Variable, to output the current date.
//   Makes it easy to see current @version of this within the Power Query Editor using the little `i` next to the step name.
// This comment is before the `let` to avoid showing up in Power Query Editor as a huge single-line.
let

    // @version 2022.5.1  // Problem is that CalVer is going `YY.month.version` like Insomnia or LG HUB (piece of poop but good versioning scheme)
    TrxnsCombined =
        Table.Combine(
            {
                Table.AddColumn(
                    t8r_CurrentTrxnsWorksheet,
                    "IsFromImport",
                    each 0,
                    type binary
                ),
                Table.AddColumn(
                    t8r_ImportSourceRemapped,
                    "IsFromImport",
                    each 1,
                    type binary
                )
            }
        ),
    #"Changed Type: Amount to Currency" =
        Table.TransformColumnTypes(
            TrxnsCombined,
            {
                {
                    "Amount",
                    Currency.Type
                }
            }
        ),
    #"Backup slug as originalSlug for upcoming NULL replacements (#BetterWay ?)" =
        Table.RenameColumns(
            #"Changed Type: Amount to Currency",
            {
                {
                    "slug",
                    "originalSlug"
                }
            }
        ),

    // > . **Create means to make something from nothing, or to make something using a lot of creativity**.
    // >
    // > -- https://www.google.ca/search?q=generate+vs+create

    // Generate a slug (natural key/id) for any records with null slug now.
    GenerateSlugIfNull =
        Table.AddColumn(
            #"Backup slug as originalSlug for upcoming NULL replacements (#BetterWay ?)",
            "slug",
            each
                if ([originalSlug] <> null) then
                    [originalSlug]
                else
                    createTrxn8rSlug(
                        [Date],
                        [Amount],
                        [Description]
                    )
                /*
                // #DevNote I generally prefer to avoid negated if statements, rather than `[originalSlug] = null`,
                // but like all good rules this is an exception because
                // THE SHORTER IF/ELSE LOGIC SHOULD GO FIRST FOR EASY READING.
                // Then you can see what the if statement was without scrolling up 100 lines to see the if statement just for a default value!
                */
        ),
    #"Removed originalSlug" =
        Table.RemoveColumns(
            GenerateSlugIfNull,
            {"originalSlug"}
        ),
    #"Reordered Columns" =
        Table.ReorderColumns(
            #"Removed originalSlug",

            // TODO!: Use Header List from TransactionsWorksheet
            {
                "slug",
                "Date",
                "Description",
                "Category",
                "Amount",
                "Account",
                "Account #",
                "Institution",
                "Month",
                "Week",
                "Check Number",
                "Full Description",
                "Transaction ID",
                "Account ID",
                "Date Added",
                "IsFromImport",
                "Balance"
            }
        ),
    // #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"Description", "Date", "Amount"}),
    // Table.Distinct(..., slug ...)
    #"Removed Duplicates by slug" =
        Table.Distinct(
            #"Reordered Columns",
            {"slug"}
        ),
    // todo: Is Table.Group or Table.Distionct better? Which allows all columns to be there, not just ones in the group by?
    /*
    #"Grouped Rows" =
        Table.Group(
            Source,
            {
                "Date",
                "Description",
                "Amount",
                "slug"
            },
            {
                {
                    "SimilarCount",
                    each Table.RowCount(_) - 1,
                    Int64.Type
                }
            }
        )
    */

    FinalStep = #"Removed Duplicates by slug"
in
    FinalStep

// t8r_ImportConfigsAsListForParamsOptions
let
    Source = t8r_ImportConfigs,
    #"Removed Other Columns" = Table.SelectColumns(Source,{"configName"}),
    configName = #"Removed Other Columns"[configName]
in
    configName

// t8r_TrxnsHeadersList
/**
 * t8r_TrxnsHeadersList
 *
 * @since
 */
let
    SourceTrxns = t8r_CurrentTrxnsWorksheet,
    Cols = Table.ColumnNames(SourceTrxns),

    // add for when slugs are added, but this way user can remap it as well!
    // #ProTip Watch out for the syntax below - it is a list of lists
    // #reference https://docs.microsoft.com/en-us/powerquery-m/list-combine

    /*
    Currently putting slug at beginning for easy debugging 2020-05-31
    Re-order here, or later, if need-be.
    Not sure if this will mess anything up copy/pasting Transactions later, however,
    it should be okay since we can re-order columns in a later, more appropriate, step.

    Feel free to re-arrange to put slug on end by swapping the args to [[List.Combine]]:

        `...Cols, { "slug" }...

    #OrderOfOperations

    UPDATE about 1 hour later - USING SLUG AT END SINCE IT MAY BE DROPPED.
    Did not like it showing up in the first column of the ImportConfigsWorksheet the user edts.
    */
    AddSlug = List.Combine(
        {
            Cols,
            { "slug" }

        }
    ),

    /*
    TODO: #Research if the compiler/processor (#WhichIsIt) sees these steps are the same
    and eliminates the extra, or if it actually adds some kind of overhead?
    */

    //
    FinalStep = AddSlug

in
    FinalStep

// t8r_ImportSourceHeaders
let
    Source = t8r_ImportSourceDataShortcut,
    ColNames = Table.ColumnNames(Source),
    #"Converted to Table" = Table.FromList(ColNames, Splitter.SplitByNothing(), null, null, ExtraValues.Ignore),
    #"Renamed Columns" = Table.RenameColumns(#"Converted to Table",{{"Column1", "SourceHeaderName"}})
in
    #"Renamed Columns"

// Transform File SampleFileParam
#"Sample File" meta [IsParameterQuery=true, BinaryIdentifier=#"Sample File", Type="Binary", IsParameterQueryRequired=true]

// Transform Sample File
let
    Source = Csv.Document(#"Transform File SampleFileParam",[Delimiter=",", Columns=4, Encoding=1252, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
in
    #"Promoted Headers"

// TEST_t8r_GetConfigValue
let
    // cyclic reference error debug 2022-06-03...
    Source = t8r_GetConfigValue("fileNamePattern")
in
    Source

// DUMP shared
let
    Source = #shared,
    #"Value ResourceExpression" = Source[Value.ResourceExpression]
in
    #"Value ResourceExpression"

// DUMP shared Functions
let
    Source = #shared,
    #"Converted to Table" = Record.ToTable(Source)
in
    #"Converted to Table"

// t8r_TrxnsHeadersTableForWorksheet
/**
 * VERY IMPORTANT - DO NOT REMOVE - USED BY THE CONFIG WORKSHEET USER EDITS.
 */

let
    Source = t8r_TrxnsHeadersList,
    ConvertedToTable = Table.FromList(
        Source,
        Splitter.SplitByNothing(),
        null,
        null,
        ExtraValues.Error
    )
    // #"Transposed Table" = Table.Transpose(#"Converted to Table"),
    // #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table", [PromoteAllScalars=true])
in
    ConvertedToTable

// t8r_TrxnsFromImport
let
    Source = t8r_TrxnsAfterImportAll,
    #"Filtered Rows" = Table.SelectRows(Source, each [File.Name] <> null and [File.Name] <> ""),
    #"Sorted Rows" = Table.Sort(#"Filtered Rows",{{"Date", Order.Ascending}})
in
    #"Sorted Rows"

// t8r_TrxnsWorkbookWorksheetNamesList
let
    Source = t8r_TrxnsWorkbook,
    #"Keep Name Column Only" = Table.SelectColumns(Source,{"Name"}),
    Name = #"Keep Name Column Only"[Name]
in
    Name

// DEBUG_t8r_GetConfigValue
let

        configName = "fileNamePattern",
        // https://docs.microsoft.com/en-us/powerquery-m/table-selectrows
        SelectedRows = Table.SelectRows(
            T8R_CONFIG_WORKSHEET,
            each [Name] = configName
        ),

        Value =
            if (Table.IsEmpty(SelectedRows)) then
                error Error.Record(
                    "No Config Found",
                    "No configuration was found. T8R_CONFIG_NAME_TO_USE: " & T8R_CONFIG_NAME_TO_USE
                )
            else
                SelectedRows[configName]
        ,

        // Cannot do this since it is an alias to values returned from me...
        // ...which means...cyclic reference error ;)
        // SelectedRows = T8R_CURRENT_IMPORT_CONFIG,


        // WARNING: I don't know enough if SingleRow below would be better:
        // SelectedRows{0}[Value]
        // Should besome validation for a null / 0 record result right?
        // Row = Table.SingleRow(SelectedRows),

        // Throw Custom Error if No Config Found (can be troublesome debugging this within a function w/o steps).
        // https://ssbi-blog.de/blog/technical-topics-english/how-to-handle-custom-errors-in-m-gracefully/
        // FinalStep =
        //     if (Table.IsEmpty(Row)) then
        //         error Error.Record(
        //             "No Config Found",
        //             "No configuration was found. T8R_CONFIG_NAME_TO_USE: " & T8R_CONFIG_NAME_TO_USE
        //         )
        //     else
        //         Row[Value]



        // FinalStep = SelectedRows[Value]
        FinalStep = Value
        //FinalStep = Row
    in
        FinalStep