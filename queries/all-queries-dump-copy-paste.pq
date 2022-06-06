// T8R_CONFIG_MAIN
/**
 * T8R_CONFIG_MAIN
 * #important
 *
 * Defaults to the first config if the specified one cannot be found.
 * Other queries/params come back to me for data.
 *
 * Merged in previous step `T8R_CONFIG_WORKSHEET` on 2022-06-06.
 * Trying to reduce time it takes Excel to load.
 * DAX Studio says queries are running fast, even the final one in a mere 20 ms.
 * Excel is slow though, I feel it is:
 * 1. Loading too many tables / analyzing too much in the [[Power Pivot Data Model]]; and/or
 * 2. Fast Data Load setting freezing PC.
 *
 * @since   2022-06-01
 * @version 2022-06-02
 * @version 2022-06-06
 */
let

    // ImportConfigName = t8r_GetConfigValue("T8R_CONFIG_NAME_TO_USE"),
    // An error occurred in the ‘t8r_GetConfigValue’ query. Expression.Error: A cyclic reference was encountered during evaluation.
    // T8R_CONFIG_WORKSHEET = T8R_CONFIG_WORKSHEET`,


    // Aliasing params here for clarity and easy debugging.
    T8R_CONFIG_WORKSHEET_NAME = T8R_CONFIG_EXCEL_TABLE_NAME,
    CurrentWorkbook = Excel.CurrentWorkbook(),
    ConfigWorksheet = CurrentWorkbook{[Name=T8R_CONFIG_WORKSHEET_NAME]},
    ConfigTable = ConfigWorksheet[Content],
    #"Filtered Rows" = Table.SelectRows(ConfigTable, each [Name] <> null),
    #"Removed Other Columns" = Table.SelectColumns(
        #"Filtered Rows",
        {"Name", "Value"}
    ),
    #"Transposed Table" = Table.Transpose(#"Removed Other Columns"),
    #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table", [PromoteAllScalars=true]),
    //#"Kept First Rows" = Table.FirstN(#"Promoted Headers",1)
    #"Kept First Rows" = #"Promoted Headers"{0}
in
    #"Kept First Rows"

// T8R_CONFIG_EXCEL_TABLE_NAME
"T8R_CONFIG_TABLE" meta [IsParameterQuery=true, List={"T8R_CONFIG_TABLE"}, DefaultValue="T8R_CONFIG_TABLE", Type="Text", IsParameterQueryRequired=true]

// T8R_IMPORT_FOLDER_PATH
/**
 * T8R_IMPORT_DIR
 *
 * @since   2022-06-01
 * @version 2022-06-03
 */
let
    Config = T8R_CONFIG_MAIN,
    FolderPath = Config[T8R_IMPORT_FOLDER_PATH],
    // Add Root Folder if T8R_IMPORT_FOLDER_PATH starts with "\"
    FolderPathLogic =
        if Text.Start(FolderPath, 1) <> "\"
            then Config[T8R_IMPORT_FOLDER_PATH]
        else
            // Combine Root and Folder P{ath, Cleanup Double Slashes
            Text.Replace(
                T8R_ROOT_FOLDER_PATH & FolderPath,
                "\\",
                "\"
            )
            /*
            // Use Text.Combione top remove double slashes (e.g. `W:\src\trxn8r-data\\samples\)
            Text.Combine(
                // todo: #performance #slow #bad ?
                Text.Split(
                    T8R_ROOT_FOLDER_PATH & FolderPath,
                    "\"
                ),
                "\"
            )
            */


in
    FolderPathLogic

// T8R_ROOT_FOLDER_PATH
let
    Source = T8R_CONFIG_MAIN[T8R_ROOT_FOLDER_PATH]
in
    Source

// T8R_IMPORT_FILES
/**
 * T8R_IMPORT_FILES
 *
 * #Important
 *
 * @since   2022-06-05
 * @version 2022-06-05
 * @version 2022-06-06 - Joined t8r_ImportFilesAll and T8R_SOURCE_FILES into T8R_IMPORT_FILES
 */
let
    // param style - "Data source settings" will update this.
    // Source = Folder.Files("W:\src\trxn8r-data"),
    // Config Value from Worksheet, found it easier than managing Data source and Params.
    // Added benefit of being saveable in the Excel sheet.
    ImportFolderPath = T8R_IMPORT_FOLDER_PATH,
    Source = Folder.Files(
        ImportFolderPath
    ),
    #"Renamed Columns" = Table.RenameColumns(
        Source,
        {
            {"Name", "ImportFile.Name"},
            {"Extension", "ImportFile.Extension"},
            {"Content", "ImportFile.Content"},
            {"Folder Path", "ImportFile.Folder Path"}
        }
    ),
    #"Removed Other Columns" = Table.SelectColumns(
        #"Renamed Columns",
        {"ImportFile.Content", "ImportFile.Name", "ImportFile.Extension", "ImportFile.Folder Path"}
    ),
    /*
    > **Tip**
    > It's a good idea to create a new column and keep the original columns
    > so you can better prevent refresh errors that might happen down the road.
    >
    > -- https://support.microsoft.com/en-us/office/merge-columns-power-query-80ec9e1e-1eb6-4048-b500-d5d42d9f0a8d#supAppliesToTableContainer

    #"Merged Columns" = Table.CombineColumns(#"Sorted Rows",{"Folder Path", "Name"},Combiner.CombineTextByDelimiter("", QuoteStyle.None),"FilePath")
    */
    /*
     AddedFilePath = Table.AddColumn(
         #"Removed Other Columns",
         "FilePath",
         each [Folder Path] & [Name]
     ),
     */
     /* Just realized this would be less optimal than Adding both Columns and performing one Column Reorder */
    // #"Added ShouldImport" = TableAddColumnToBeginning(
    AddedShouldImport = Table.AddColumn(
        #"Removed Other Columns",
        "ImportFile.ShouldImport",
        each [ImportFile.Extension] = ".csv",
        type logical
    ),
    #"Sorted Rows" = Table.Sort(
        AddedShouldImport,
        {
            {"ImportFile.ShouldImport", Order.Descending},
            {"ImportFile.Folder Path", Order.Ascending},
            {"ImportFile.Name", Order.Ascending}
        }
    )
in
     #"Sorted Rows"

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

// T8R_IMPORT_CONFIGS_EXCEL_TABLE_NAME
"t8r_ImportConfigsTable" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]

// t8r_ImportConfigs
/**
 * t8r_ImportConfigs
 *
 * @version
 * @since 2022-06-03
 */
// Source = Excel.CurrentWorkbook(){[Name=T8R_CONFIGS_WS_NAME]}[Content],\
let

    // @version 2022-06-03
    // cyclcic reference with t8r_GetConfig on 2022-06-03
    // Source = Excel.CurrentWorkbook(){[Name=T8R_IMPORT_CONFIGS_TABLE_NAME]}[Content],
    Source = t8r_GetWorksheet(T8R_IMPORT_CONFIGS_EXCEL_TABLE_NAME),
    // table has records in the columns, since there are 80% more Values (x-axis) than Records (y-axis) #MadeUpStats
    SourceAsTable = Table.Transpose(Source),
    #"Promoted Headers" = Table.PromoteHeaders(SourceAsTable, [PromoteAllScalars=true]),
    #"Removed Blank Rows" = Table.SelectRows(
        #"Promoted Headers",
        each [ConfigName] <> null
    ),
    // Require text for Fuzzy Matching in [[t8r_.....?]]
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Blank Rows",{
        {"FileNameMatches", type text},
        {"ConfigName", type text},
        {"Note", type text}
    })
in
    #"Changed Type"

// t8r_ImportConfigsWithFiles
/**
 * @since   2022-06-05
 * @version 2022-06-06
 */
let
    // #DebugHelper
    ImportConfigs = t8r_ImportConfigs,
    ImportFiles = T8R_IMPORT_FILES,

    // https://support.microsoft.com/en-us/office/create-a-fuzzy-match-power-query-ffdd5082-c0c8-4c8e-a794-bd3962b90649
    /*
    Here we are basically getting all the files for each config.
    Except! I reversed the join so we actually get all Files with their configs
    Same diff? :shrug: (#ProTip Power Query Editor does not support emojis :sad_face:)
    */
    #"Merged Queries" = Table.FuzzyNestedJoin(
        ImportConfigs,
        {"FileNameMatches"},

        ImportFiles,
        {"ImportFile.Name"},

        "ImportFiles",

        // https://support.microsoft.com/en-us/office/merge-queries-power-query-fd157620-5470-4c0f-b132-7ca2616d17f9
        // #tip The FullOuter lets us see all the files and the configs, so we can #debug why they didn't match.
        // JoinKind.LeftOuter,
        JoinKind.FullOuter,
        [
            IgnoreCase=true,
            IgnoreSpace=false,
            /*
            > NumberOfMatches Controls the maximum number of matching rows that will be returned for each input row.
            > For example, if you only want to find one matching row for each input row, specify a value of 1.
            > **The default behavior is to return all matches.**
            // NumberOfMatches=1,
            */
            Threshold=T8R_FUZZY_MATCH_THRESHOLD
        ]
    ),
    #"Filtered Rows" = Table.SelectRows(#"Merged Queries", each [ConfigName] <> null and [ConfigName] <> "")
in
    #"Filtered Rows"

// T8R_FUZZY_MATCH_THRESHOLD
0.1 meta [IsParameterQuery=true, Type="Number", IsParameterQueryRequired=true]

// t8r_ImportConfigsWithFiles (2)
/**
 *
 * @since 2022-06-06
 * @version 2022-06-06
 */
let
    Source = t8r_ImportConfigsWithFiles,
    ConvertCsvColumnsToList = Table.AddColumn(
        Source,
        "CsvColumnsList",
        each Text.Split(
            // prevent null not text error.
            [CsvColumns] ?? "",
            ","
        )
    ),
    #"Reordered Columns1" = Table.ReorderColumns(ConvertCsvColumnsToList,{"ImportFiles", "CsvColumnsList", "ConfigName", "Note", "FileNameMatches", "UseFirstRowAsHeaders", "FolderPath", "TransformerName", "IsTransformerValid", "CsvColumns", "RemainingFieldsAreDynamic", "Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Column8", "Column9", "Column10", "slug", "Column21", "Column22", "Column23", "Column24"}),
    AddCsvDoc = Table.AddColumn(
       #"Reordered Columns1",
        "CsvDoc",
        each t8r_TransformCsvFile_func(
            [ImportFile.Content],
            [CsvColumnsList],
            [UseFirstRowAsHeaders]
        )
    ),
    #"Expanded ImportFiles" = Table.ExpandTableColumn(
        AddCsvDoc,
        "ImportFiles",
        {"ImportFile.Content", "ImportFile.Name", "ImportFile.Extension", "ImportFile.Folder Path", "ImportFile.ShouldImport"}
    )
in
    #"Expanded ImportFiles"

// t8r_TransformCsvFile_func
let
    TransformCsv_func = (
        FileContent as binary,
        ColumnsList as list,
        UseFirstRowAsHeaders
        // Renames as list
        /*, Delimter as text*/
    ) =>
        let
            Delimiter = ",",
            Cols =
                if(List.IsEmpty(ColumnsList)) then
                    null
                else
                    ColumnsList,

            CsvDoc = Csv.Document(
                FileContent,
                Cols,
                Delimiter
            ),

            PromotedHeaders =
                if (UseFirstRowAsHeaders = false) then
                    // nothing
                    CsvDoc
                else
                  Table.PromoteHeaders(CsvDoc)


            //Mapped = t8r_MapTrxns(PromotedHeaders)

            // Now this result should wind up going through [[t8r_RemapCsv_func]] next.
        in PromotedHeaders
in
    TransformCsv_func

// t8r_ImportFilesTransformed
/**
 * t8r_ImportFilesTransformed
 *
 * @since 2022-06-04
 * @version 2022-06-05
 */
let
    Source = t8r_ImportConfigsWithFiles,

/*
    #"Reordered Columns" = Table.ReorderColumns(
        Source,
        {"Config.ConfigName", "Config.FileNameMatches", "Config.UseFirstRowAsHeaders", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"
        }
    ),
*/
     AddCsvDoc = Table.AddColumn(
       Source,
        "CsvDoc",
        each t8r_TransformCsvFile_func(
            [Content],
             // Csv.Document(...) options
            Text.Split(
                // prevent null not text error.
                [Config.CsvColumns] ?? "",
                ","
            ),
            [Config.UseFirstRowAsHeaders] // Use FirstRowAsHeaders
        )
    ),
    RemapCsvDoc = Table.AddColumn(
        AddCsvDoc,
        "CsvDocMapped",
        each t8r_RemapCsv_func([CsvDoc])
    ),

    Transformed = Table.AddColumn(
        RemapCsvDoc,
        "CsvDocTransformed",
        each

            // Expression.Evaluate(
            // [Config.TransformerName],
            // https://ssbi-blog.de/wp-content/uploads/2017/11/16-ExpressionEvaluate-in-a-calculated-column_solution.jpg
            // [ _=_ ]
            Function.Invoke(
                // Expression.Evaluate will get the function to pass to Function.Invoke
                Expression.Evaluate(
                    [Config.TransformerName],
                    #shared
                ),
                // Call with a couple arguments
                // Like specificity over passing entire row, especially for testing.
                // Could be old bad habits, or new good ones.
                {
                    [CsvDoc],
                    [File.Name],
                    _
                }
            )
            /*
            Record.AddField(
                #shared,
                "t8r_CurrentCsvDoc",
                _
            )
            */
        // )
    )
in
    Transformed

// t8r_RemapCsv_func
let
    t8r_MapCsv_func = (CsvDocument) =>
        let
            Source = CsvDocument
        in
            Source

in
    t8r_MapCsv_func

// t8r_ImportFilesNormalized
/**
 * t8r_ImportFilesNormalized
 *
 * @since   2022-06-05
 * @version 2022-06-05
 *
 */
let
    // Expanded the CsvDoc that passed through the Custom Transformers
    Source = t8r_ImportFilesTransformed,
    #"Removed Columns" = Table.RemoveColumns(
        Source,
        {"CsvDocMapped", "CsvDoc"}
    ),
    Normalized = Table.AddColumn(
        #"Removed Columns",
        "CsvNormalized",
        each t8r_NormalizeCsv_func(
            [CsvDocTransformed]
        )
    ),
    #"Reordered Columns" = Table.ReorderColumns(
        Normalized,
        // todo: #fragile, nice to be dynamic list
        {
            "CsvNormalized", "CsvDocTransformed", "Config.ConfigName", "Config.UseFirstRowAsHeaders", "Config.CsvColumns", "Config.FileNameMatches", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"
        }
    ),
    TrxnsHeadersList = T8R_SOURCE_TRXNS_HEADERS_LIST,
    //
    SelectColumnCsvNormalized = Table.SelectColumns(
        #"Reordered Columns",
        {"CsvNormalized"}
    ),
    #"Expanded CsvNormalized" = Table.ExpandTableColumn(
        SelectColumnCsvNormalized,
        "CsvNormalized",
        TrxnsHeadersList
    ),
    #"Changed Type" = Table.TransformColumnTypes(
        #"Expanded CsvNormalized",
        {
            {"Date", type date},
            {"Amount", Currency.Type},
            {"Description", type text},
            {"Account", type text},
            {"Account #", type text},
            {"Institution", type text}
        }
    ),
    #"Filtered Rows" = Table.SelectRows(
        #"Changed Type",
        each [Date] <> null
    )
in
    #"Filtered Rows"

// T8R_SOURCE_WORKBOOK_PATH_PROCESSED
/**
 * @since   2022-06-01
 * @version 2022-0-03
 */
let
    ConfigMain = T8R_CONFIG_MAIN,
    RootPath = ConfigMain[T8R_ROOT_FOLDER_PATH],
    WorkbookPath = ConfigMain[T8R_SOURCE_WORKBOOK_PATH],
    ConfigValue = RootPath & WorkbookPath
in
    ConfigValue

// T8R_SOURCE_WORKBOOK
/**
 * Used by [[t8r_GetWorksheetFromTrxnsWorkbook]]
 * Have to use raw code here, circular references trying some other weird things.
 * Made more sense to me than seeing `Excel.Workbook(...` in multiple tables (e.g. [[t8r_Source_Transactions]], [[t8r_Souce_BalanceHistory]], [[t8r_Source_Categories]])
 *
 * @alias   t8r_SourceWorkbook
 * @since   2022-06-02
 * @version 2022-06-05
 */
let
    // alias the var here to see it in "Applied Steps" for painless debugging
    WorkbookPath = T8R_SOURCE_WORKBOOK_PATH_PROCESSED,
    //
    Workbook = Excel.Workbook(
        File.Contents(WorkbookPath),
        false,
        true
    )
in
    Workbook

// T8R_SOURCE_TRANSACTIONS
/**
 * T8R_SOURCE_TRANSACTIONS
 * #important
 *
 * #todo Possibly shorten name to T8R_SOURCE_TRXNS ?
 *
 * @since   2022-06-05
 * @version 2022-06-06
 */
let
    SourceWorkbook = T8R_SOURCE_WORKBOOK,
    TrxnsWorksheetName = T8R_SOURCE_TRXNS_WORKSHEET_NAME,
    //
    // Data = t8r_GetSourceWorkbookItem_func(TrxnsWorksheetName),
    Worksheet = SourceWorkbook{[Name=TrxnsWorksheetName]},
    Data = Worksheet[Data],

    // todo: Put this in to fix new sample download but is it needed? 2022-06-05
    PromotedHeaders = Table.PromoteHeaders(Data),

    /*
    //. Generated by Power Query
    #"Removed Blank Rows MaybeDelete" = Table.SelectRows(
        PromotedHeaders,
        each not List.IsEmpty(
            List.RemoveMatchingItems(
                Record.FieldValues(_),
                {"", null}
            )
        )
    ),
    */
    // Safe to say that null Date's are empty rows, right? Voids our comparison later an yway.
    // lol, ya,m it would break the below TransformColumnTypes too.
    #"Removed null Dates" = Table.SelectRows(
        PromotedHeaders,
        each [Date] <> null
    ),
    #"Changed Type" = Table.TransformColumnTypes(
        #"Removed null Dates",
        {
            {"Date", type date},
            {"Amount", Currency.Type}
        }
    ),
    #"Sorted Rows" = Table.Sort(#"Changed Type",{{"Date", Order.Ascending}})
in
    #"Sorted Rows"

// T8R_SOURCE_TRXNS_WORKSHEET_NAME
/**
 *
 * @since 2022-06-01
 */
let
    // alias for quick debugging with Steps Navigator
    T8R_CONFIG_MAIN = T8R_CONFIG_MAIN,
    // logic...
    ConfigValue = T8R_CONFIG_MAIN[T8R_TRXNS_WORKSHEET_NAME],
    DefaultOverwrite =
        if (ConfigValue = null)
        then "Transactions"
        else ConfigValue

in
    DefaultOverwrite

// T8R_SOURCE_TRXNS_HEADERS_LIST
/**
 * t8r_TrxnsHeadersList
 *
 * @since
 */
let
    SourceTrxns = T8R_SOURCE_TRANSACTIONS,
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

// t8r_NormalizeCsv_func
/**
 * Invoked by [[t8r_ImportFilesWithCsvDocNormalized]]
 *
 * @since   2022-06-04
 * @version 2022-06-04
 */
let
    t8r_TrxnsHeadersList = T8R_SOURCE_TRXNS_HEADERS_LIST,
    t8r_NormalizeCsvDoc_func = (CsvDoc) =>

    let  NormalizedCols = Table.SelectColumns(
        CsvDoc,
        t8r_TrxnsHeadersList,
        MissingField.UseNull
    )
    in NormalizedCols
in
    t8r_NormalizeCsvDoc_func

// t8r_ImportFilesCombinedWithCurrent
/**
 * @since 2022-06-05
 */
let
    Source = t8r_ImportFilesNormalized,
    #"Appended Query" = Table.Combine(
        {
            Table.AddColumn(
                T8R_SOURCE_TRANSACTIONS,
                "IsFromImport",
                each 0,
                Number.Type
            ),
            Table.AddColumn(
                Source,
                "IsFromImport",
                each 1,
                Number.Type
            )
        }
    )
in
    #"Appended Query"

// t8r_ImportFilesCombinedWithSlug
/**
 * Set slug as either the original oe (slugFromSource) or a newly generated one.
 *
 * @since  2022-06-05
 */
let
    Source = t8r_ImportFilesCombinedWithCurrent,

    #"Renamed Columns" = Table.RenameColumns(Source,{
        {"slug", "slugFromSource"}
    }),
    AddSlug = Table.AddColumn(
        #"Renamed Columns",
        "slug",
        each
            if [slugFromSource] <> null
                then [slugFromSource]
                else
                    createTrxn8rSlug(
                        [Date],
                        [Amount],
                        [Description]
                    )
    )
in
    AddSlug

// createTrxn8rSlug
// todo: ! Account for Account Number and `Account` (not trying to be funny, just how my brain thinks)
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

// t8r_ImportFilesNormalizedWithSlugDeduped
let
    Source = t8r_ImportFilesCombinedWithSlug,
    #"Removed Duplicates" = Table.Distinct(
        Source,
        {"slug"}
    )
in
    #"Removed Duplicates"

// t8r_ImportCsvTrxns_FINAL
/**
 * @since   2022-06-05
 * @version 2022-06-05
 */
let
    Source = t8r_ImportFilesNormalizedWithSlugDeduped,
    #"Removed Blank Rows" = Table.SelectRows(Source, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Filtered Rows with Null Date" = Table.SelectRows(#"Removed Blank Rows", each [Date] <> null),
    // #tip Tweak Sorting Here or #todo Create a Param for FinalSortOrder
    #"Sorted Rows" = Table.Sort(#"Filtered Rows with Null Date",{{"Date", Order.Ascending}}),
    #"Filtered Rows" = Table.SelectRows(#"Sorted Rows", each ([IsFromImport] = 1))
in
    #"Filtered Rows"

// t8r_TrxnsHeadersTableForWorksheet
/**
 * VERY IMPORTANT - DO NOT REMOVE - USED BY THE CONFIG WORKSHEET USER EDITS.
 */

let
    Source = T8R_SOURCE_TRXNS_HEADERS_LIST,
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

// TableAddColumnToBeginning
/*
  Table.AddColumn
    // Move Custom Columns (FilePath, ShouldImport) to the beginning.
    #"Reordered Columns1" = Table.ReorderColumns(
        AddFilePath,
        List.Zip()
        {"FilePath", "ShouldImport""Folder Path", "Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes"})
    ,
*/
/*
            Table.AddColumn(table as table, newColumnName as text, columnGenerator as function, optional columnType as nullable type) as table
https://docs.microsoft.com/en-us/powerquery-m/table-addcolumn
            */
let
    Source = (table, newColumnName, columnGenerator, columnType) =>
        let

            AddedColumn = Table.AddColumn(
                table,
                newColumnName,
                columnGenerator,
                columnType
            ),
            // Move Custom Columns (FilePath, ShouldImport) to the beginning.
            ReorderedColumns = Table.ReorderColumns(
                AddedColumn,
                List.Zip(
                    { newColumnName },
                    Table.ColumnNames(table)
                )
            )
        in
            ReorderedColumns
in
    Source

// test-1-SmokeTest
/* Disabled b/c of major refactoring 2022-06-05 */

let DummyTest = "HelloThere"
in DummyTest

/* 222-06-05
let
            // { "Name", "Result", "Note", "PassFail" },
            // { "Name", "Result", "Type" },
            // { "Name", "Result" },


        Results = Table.FromList({
            "T8R_CONFIG_EXCEL_TABLE_NAME",
            "T8R_CONFIG_WORKSHEET",
            "T8R_CONFIG_MAIN",

            // TRANSACTIONS INFO
            "T8R_TRXNS_WORKBOOK_PATH",
            "T8R_TRXNS_WORKSHEET_NAME",

            // IMPORT ( #IMPORTANT )
            "t8r_ImportConfigs",
            "t8r_ImportConfigsAsListForParamsOptions",
            "t8r_ImportConfigCurrent",

            "t8r_ImportSourceHeaders",
            // pt2
            "T8R_IMPORT_CONFIGS_TABLE_NAME",
            "T8R_IMPORT_CONFIG_NAME_TO_USE",
            "T8R_IMPORT_DIR",
            // WRAPPER FUNCTION
            "t8r_GetImportConfigValue"
        }

    ),
    #"Renamed Columns" = Table.RenameColumns(Results,{{"Column1", "Name"}}),
    #"Invoked Custom Function" = Table.AddColumn(
        #"Renamed Columns",
        "EvalResult",
        each Expression.Evaluate(
            [Name],
            #shared
        )
    ),

    #"Added result_type" = Table.AddColumn(
        #"Invoked Custom Function",
        "EvalResultType",
        // shorthand for () => (or something like that?)
        each try Value.Type([EvalResult])
    ),
    #"Expanded result_type1" = Table.ExpandRecordColumn(#"Added result_type", "EvalResultType", {"HasError", "Error"}, {"HasError", "Error"}),
    #"Sorted Rows" = Table.Sort(
        #"Expanded result_type1",
        {
            {"HasError", Order.Descending},
            {"Name", Order.Ascending}
        }
    ),
    #"Renamed Columns1" = Table.RenameColumns(#"Sorted Rows",{{"Error", "EvalError"}}),
    #"Expanded EvalError" = Table.ExpandRecordColumn(#"Renamed Columns1", "EvalError", {"Reason", "Message", "Detail", "Message.Format", "Message.Parameters"}, {"EvalError.Reason", "EvalError.Message", "EvalError.Detail", "EvalError.Message.Format", "EvalError.Message.Parameters"}),
    #"Expanded EvalError.Message.Parameters" = Table.ExpandListColumn(#"Expanded EvalError", "EvalError.Message.Parameters")
in
    #"Expanded EvalError.Message.Parameters"

    */

// TransformCsv
let
    Source = (#"Transform File SampleFileParam" as binary) => let
        Source = Csv.Document(#"Transform File SampleFileParam",[Delimiter=",", Columns=4, Encoding=1252, QuoteStyle=QuoteStyle.None]),
        #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
    in
        #"Promoted Headers"
in
    Source

// TransformCsvFromCIBC
/**
 * After modifying, review results in [[t8r_ImportFilesWithCsvDocTransformersInvoked#CsvDocTransformed]]
 *
 */
//(SampleCIBCFileBinary as binary) =>
let
// Shared = #shared,
// SampleFileNameKey = "_CurrentImportFileName",
// SampleFileName = #shared[SampleFileNameKey],

// TransformFileFromCIBC = (CsvDoc) =>

// PLEASE DO NOT USE FullRecordForDebuggingOnly -- UNLESS IT IS SOMEHOW BEST.
// Better to be more specific with the names we pass in, some other comment somewhere about why.
// 2022-06-04

// #ProTip #KeyboardShortcut <kbd>`WIN` + `ALT` + `D`</kbd> = Show Calendar Popup in Windows Taskbar!
// There. Now this wasn't a waste of time ;) I was being very doubtful a couple hours ago.
TransformFileFromCIBC = (CsvDoc as table, FileName as text, FullRecordForDebuggingOnly as record) =>
    let
        // #future I think this is where we can consume a web service, JSON, YAML, whatever Power Query may parse.
        // as long as it comes out as a table with headers that can be mapped using the Configs Worksheet.
        /*
        Source = Csv.Document(
            SampleCIBCFileBinary,
            // square bracket = new record; Compoared to { someList } with curly braces. (braces, brackets?)
            [
                Delimiter=",",
                Columns=4,
                Encoding=1252,
                QuoteStyle=QuoteStyle.None
            ]
        )
        */
        Source = CsvDoc,
        // Source = t8r_CurrentImportCsvDoc,
        // todo: #research Table.TransformColumn
        ChangeType = Table.TransformColumnTypes(
            Source,
            {
                {"Deposit", Currency.Type},
                {"Withdrawal", Currency.Type}
            }
        ),
        CalculateAmount = Table.AddColumn(
            ChangeType,
            "Amount",
            each
                [Deposit] ?? [Withdrawal]
                // ?? Is a NULL COALLESCING operator (I think?) but it just picks whichever is not null.
                // You can add as many as you like. [A] ?? [B] ?? [C] ?? [D]
                // todo: Add Reference
        ),
        AddInstitution = Table.AddColumn(
            CalculateAmount,
            "Institution",
            each "CIBC"
        ),
        AddAccountNumber = Table.AddColumn(
            AddInstitution,
            "Account #",
            each "xxxx9876",
            // ohh tricky, not a number ;)
            Text.Type
        ),
        AddAccount = Table.AddColumn(
            AddAccountNumber,
            "Account",
            each "cibc-9876",
            // ohh tricky, not a number ;)
            Text.Type
        )
    in
        AddAccount
        // WARNING: Be sure to updat that final `in` statement above with your final step
        // Otherwise it results in being the step that come after the `in`.
in
    TransformFileFromCIBC

// TransformCsvFromEQBank
let
// Shared = #shared,
// SampleFileNameKey = "_CurrentImportFileName",
// SampleFileName = #shared[SampleFileNameKey],

// TransformFileFromCIBC = (CsvDoc) =>
TransformFileFromCIBC = (CsvDoc as table, FileName as text, FullRecord as record) =>
    let
        // #future I think this is where we can consume a web service, JSON, YAML, whatever Power Query may parse.
        // as long as it comes out as a table with headers that can be mapped using the Configs Worksheet.
        /*
        Source = Csv.Document(
            SampleCIBCFileBinary,
            // square bracket = new record; Compoared to { someList } with curly braces. (braces, brackets?)
            [
                Delimiter=",",
                Columns=4,
                Encoding=1252,
                QuoteStyle=QuoteStyle.None
            ]
        )
        */
        Source = CsvDoc,
        // Source = t8r_CurrentImportCsvDoc,
        // todo: #research Table.TransformColumn
        ChangeType = Table.TransformColumnTypes(
            Source,
            {
                {"Transfer", Currency.Type},
                {"Balance", Currency.Type}
            }
        ),
        AddAmount = Table.AddColumn(
            ChangeType,
            "Amount",
            each [Transfer]
        ),
        AccountNum = List.First(Text.Split(FileName, " ")),
        AddAccount = Table.AddColumn(
            AddAmount,
            "Account",
            // "111222333 Details.csv" - Split on the space, take first part
            each AccountNum
        )

        // Some files are Headerless (:scary:) so this may be left out.
        // Actually whole reason custom TransformerFunctions came in at all.
        //#"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),

    in
        AddAccount
in
    TransformFileFromCIBC

// T8R_SOURCE_WORKBOOK_PATH_PARAM
"W:\src\trxn8r-data\samples\Tiller-Foundation-Template.sample1.with-dummy-trxns.xlsx" meta [IsParameterQuery=true, List={"W:\src\trxn8r-data\samples\Tiller-Foundation-Template.sample1.with-dummy-trxns.xlsx"}, DefaultValue="W:\src\trxn8r-data\samples\Tiller-Foundation-Template.sample1.with-dummy-trxns.xlsx", Type="Text", IsParameterQueryRequired=true]

// t8r_SourceWorkbookWorksheetNamesList
let
    Source = T8R_SOURCE_WORKBOOK,
    #"Keep Name Column Only" = Table.SelectColumns(Source,{"Name"}),
    Name = #"Keep Name Column Only"[Name]
in
    Name