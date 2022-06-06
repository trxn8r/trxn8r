// T8R_CONFIG_WORKSHEET
/**
 * T8R_CONFIG_WORKSHEET
 *
 * Defaults to the first config if the specified one cannot be found.
 *
 * @version 2022-06-02
 * @since   2022-06-01
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
    #"Filtered Rows" = Table.SelectRows(ConfigTable, each [Name] <> null)

in
    #"Filtered Rows"


    /*
    ,
    SelectedConfig = Table.SelectRows(
        ConfigTable,
        each [Name] = ImportConfigName
    ),

    FinalStep = SelectedConfig



in
    FinalStep

*/



    /* THIS IS SOMETHIONG TO DO WITH CSV IMPORT CONFIGS NOT THE OVERALL T8R CONFIG

    ,
    // Default to first config if none is found (TODO: might be bad...? Throw error instead? Ya...)
    CheckIfConfigFound =
        if (Table.RowCount(SelectedConfig) > 0) then
            ImportConfigName
        else
            // Table.First(ImportConfigs)[configName],
            // > Syntax: Table.First(table as table, optional default as any) as any

            // THROW ERROR
            // https://docs.microsoft.com/en-us/power-query/handlingerrors
            error "TRXN8R Configuration Worksheet was not found :( Dying now....ice age..."
    , // end CheckIfConfigFound

    // prevent PQ editor stripping steps.
    FinalStep = CheckIfConfigFound

in
    FinalStep
   */




/*
    // ImportedConfigName = T8R_CONFIG_WORKSHEET["configName"],
    //ImportConfigs = t8r_ImportConfigs,
*/

// T8R_CONFIG_EXCEL_TABLE_NAME
"T8R_CONFIG_TABLE" meta [IsParameterQuery=true, List={"T8R_CONFIG_TABLE"}, DefaultValue="T8R_CONFIG_TABLE", Type="Text", IsParameterQueryRequired=true]

// T8R_CONFIG_MAIN
let
    Source = T8R_CONFIG_WORKSHEET,
    #"Removed Other Columns" = Table.SelectColumns(Source,{"Name", "Value"}),
    #"Transposed Table" = Table.Transpose(#"Removed Other Columns"),
    #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table", [PromoteAllScalars=true]),
    //#"Kept First Rows" = Table.FirstN(#"Promoted Headers",1)
    #"Kept First Rows" = #"Promoted Headers"{0}
in
    #"Kept First Rows"

// T8R_SOURCE_FOLDER_PATH
/**
 * T8R_IMPORT_DIR
 *
 * @since   2022-06-01
 * @version 2022-06-03
 */
let
    Config = T8R_CONFIG_MAIN,
    ConfigValue = Config[T8R_IMPORT_FOLDER_PATH]
in
    ConfigValue

// t8r_ImportFilesAll
let
    // Alias Paramaters for for easy dumping through PQ Steps Editor
    ImportFolderPath = T8R_SOURCE_FOLDER_PATH,
    // List all Files in Import Directory
    // Source = Folder.Files(dirPath),
    Source = Folder.Files(ImportFolderPath),
    #"Added ShouldImport" = Table.AddColumn(
        Source,
        "ShouldImport",
        each [Extension] = ".csv",
        type logical
    )
in
    #"Added ShouldImport"

// t8r_ImportFilesFiltered
/**
 * FilesToImport
 *
 * @since 2022-05-20
 */
let
    // Alias Paramaters for for easy dumping through PQ Steps Editor
    FilesFiltered = Table.SelectRows(
        t8r_ImportFilesAll,
        each [ShouldImport] <> false
    )
in
    FilesFiltered

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

// t8r_ImportFilesFilteredWithConfigs
let
    // #DebugHelper
    ImportConfigs = t8r_ImportConfigs,
    SourceFilesFiltered = t8r_ImportFilesFiltered,

    // https://support.microsoft.com/en-us/office/create-a-fuzzy-match-power-query-ffdd5082-c0c8-4c8e-a794-bd3962b90649
    /*
    Here we are basically getting all the files for each config.
    Except! I reversed the join so we actually get all Files with their configs
    Same diff? :shrug: (#ProTip Power Query Editor does not support emojis :sad_face:)
    */
    #"Merged Queries" = Table.FuzzyNestedJoin(
        SourceFilesFiltered,
        {"Name"},
        ImportConfigs,
        {"FileNameMatches"},
        "t8r_ImportConfigs",

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
    // DEBUG: Look at above "Merged Queries" result and adjust the T8R_FUZZY_MATCH_THRESHOLD param as needed
    // Want to Merge the configs with the files based on the name and name param.
    #"Renamed Columns" = Table.RenameColumns(
        #"Merged Queries",
        {
            {"t8r_ImportConfigs", "Config"},
            {"Name", "File.Name"}
        }
    ),
    #"Expanded Config" = Table.ExpandTableColumn(
        #"Renamed Columns",
        "Config",
        // WARNING: BE SURE THIS LIST MATCHES WHAT IS IN THE SPREADSHEET COLUMN NAMES...
        // Table.ColumnNames(_[Config]{0}),
        {
            "ConfigName",
            "Note",
            "FileNameMatches",
            "UseFirstRowAsHeaders",
            "CsvColumns",
            "FolderPath",
            "TransformerName",
            "RemainingFieldsAreDynamic", "Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Month", "Week", "Check Number", "Full Description", "Transaction ID", "Account ID", "Date Added", "slug"
        },
        {
            "Config.ConfigName", "Config.Note", "Config.FileNameMatches", "Config.UseFirstRowAsHeaders", "Config.CsvColumns", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"
        }
    )
in
    #"Expanded Config"

// T8R_FUZZY_MATCH_THRESHOLD
0.1 meta [IsParameterQuery=true, Type="Number", IsParameterQueryRequired=true]

// t8r_ImportFilesTransformed
/**
 * t8r_ImportFilesTransformed
 *
 * @since 2022-06-04
 * @version 2022-06-05
 */
let
    Source = t8r_ImportFilesFilteredWithConfigs,

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
    TrxnsHeadersList = t8r_TrxnsHeadersList,
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
    #"Filtered Rows" = Table.SelectRows(#"Changed Type", each [Date] <> null and [Date] <> "")
in
    #"Filtered Rows"

// T8R_SOURCE_WORKBOOK_PATH
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
    WorkbookPath = T8R_SOURCE_WORKBOOK_PATH,
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
 * @since 2022-06-05
 */
let
    SourceWorkbook = T8R_SOURCE_WORKBOOK,
    TrxnsWorksheetName = T8R_SOURCE_TRXNS_WORKSHEET_NAME,
    //
    // Data = t8r_GetSourceWorkbookItem_func(TrxnsWorksheetName),
    Worksheet = SourceWorkbook{[Name=TrxnsWorksheetName]},
    Data = Worksheet[Data],

    // todo: Put this in to fix new sample download but is it needed? 2022-06-05
    PromtedHeaders = Table.PromoteHeaders(Data),

    //. Generated by Power Query
    #"Removed Blank Rows MaybeDelete" = Table.SelectRows(
        PromtedHeaders,
        each not List.IsEmpty(
            List.RemoveMatchingItems(
                Record.FieldValues(_),
                {"", null}
            )
        )
    ),
    #"Changed Type" = Table.TransformColumnTypes(
        #"Removed Blank Rows MaybeDelete",
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

// t8r_TrxnsHeadersList
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
    t8r_TrxnsHeadersList = t8r_TrxnsHeadersList,
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
        {T8R_SOURCE_TRANSACTIONS, Source}
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

// t8r_ImportFilesCombinedWithSlug (2) DEBUG
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
    ),
    #"Filtered Rows" = Table.SelectRows(AddSlug, each ([Description] = "Point of Sale - Interac RETAIL PURCHASE 274969884363 SQ *SHP - YOUR"))
in
    #"Filtered Rows"

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
    #"Sorted Rows" = Table.Sort(#"Filtered Rows with Null Date",{{"Date", Order.Ascending}})
in
    #"Sorted Rows"

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

// DUMP shared
let
    Source = #shared,
    #"Value ResourceExpression" = Source[Value.ResourceExpression]
in
    #"Value ResourceExpression"

// t8r_SourceWorkbookWorksheetNamesList
let
    Source = T8R_SOURCE_WORKBOOK,
    #"Keep Name Column Only" = Table.SelectColumns(Source,{"Name"}),
    Name = #"Keep Name Column Only"[Name]
in
    Name

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

// t8r_test_CsvDoc_sample
let
    Source = t8r_ImportFilesFilteredWithConfigs,

/*
    #"Reordered Columns" = Table.ReorderColumns(
        Source,
        {"Config.ConfigName", "Config.FileNameMatches", "Config.UseFirstRowAsHeaders", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"
        }
    ),
*/
    AddCsvColumnsAsList = Table.AddColumn(
        Source,
        "CsvColumnsAsList",
         // Csv.Document(...) options
        each Text.Split(
            // prevent null not text error.
            [Config.CsvColumns] ?? "",
            ","
        )
    ),
     AddCsvDoc = Table.AddColumn(
       AddCsvColumnsAsList,
        "CsvDoc",
        each t8r_TransformCsvFile_func(
            [Content],
            [CsvColumnsAsList],
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
    ),
    CsvDoc1 = Transformed{1}[CsvDoc]
in
    CsvDoc1

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

// t8r_GetSourceWorkbookItem_func_DELETE_DUPE_OF_GetWorksheet
/*
* @since 2022-06-05*
* @version 2022-06-06
*/
let
    Source = (ItemName) => let
        SourceWorkbook = T8R_SOURCE_WORKBOOK,
        //
        Table =
            try
                SourceWorkbook{
                    [Name=ItemName]
                }[Data]
            otherwise
                // Sheet does not exist, return an empty table, not using any for now, saving for future. 2022-06-05
                #table({}, {})
    in
        Table
in
    Source

// T8R_SOURCE_FILES
/**
 * T8R_SOURCE_FILES
 *
 * @since 2022-06-05
 *
 */
let
    Source = Folder.Files("W:\src\trxn8r-data"),
    #"Reordered Columns" = Table.ReorderColumns(Source,{"Content", "Folder Path", "Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes"}),
    #"Removed Columns" = Table.RemoveColumns(#"Reordered Columns",{"Content"}),
    #"Sorted Rows" = Table.Sort(#"Removed Columns",{{"Folder Path", Order.Ascending}, {"Name", Order.Ascending}}),

    /*
    > **Tip**
    > It's a good idea to create a new column and keep the original columns
    > so you can better prevent refresh errors that might happen down the road.
    >
    > -- https://support.microsoft.com/en-us/office/merge-columns-power-query-80ec9e1e-1eb6-4048-b500-d5d42d9f0a8d#supAppliesToTableContainer

    #"Merged Columns" = Table.CombineColumns(#"Sorted Rows",{"Folder Path", "Name"},Combiner.CombineTextByDelimiter("", QuoteStyle.None),"FilePath")
    */
     AddFilePath = Table.AddColumn(
         #"Sorted Rows",
         "FilePath",
         each [Folder Path] & [Name]
     ),
    #"Reordered Columns1" = Table.ReorderColumns(AddFilePath,{"FilePath", "Folder Path", "Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes"})
in
    #"Reordered Columns1"

// T8R_SOURCE_FILES_CSV
let
    Source = T8R_SOURCE_FILES,
    #"Filtered Rows" = Table.SelectRows(Source, each ([Extension] = ".csv"))
in
    #"Filtered Rows"

// T8R_SOURCE_FILES_WORKBOOKS
/**
 * T8R_SOURCE_FILES_WORKBOOKS
 *
 * @since   2022-06-05
 * @version 2022-06-06
 *
 */
let
    SourceDir =- T8R_SOURCE_FOLDER_PATH,
    SourceFiles = T8R_SOURCE_FILES,
    //
    #"Filtered Rows" = Table.SelectRows(
        SourceFiles,
        each ([Extension] = ".xlsx"
    ))

    /*
    ,
    #"Replaced Value" = Table.ReplaceValue(
        #"Filtered Rows",
        SourceDir,
        "",
        Replacer.ReplaceText,{"FilePath"}
    ),

    #"Renamed Columns" = Table.RenameColumns(
        #"Filtered Rows",
        {{"FilePath", "FilePathRelative"}}
    )
    */
in
     #"Filtered Rows"

// T8R_SOURCE_FILES_WORKBOOKS_LIST
/**
 * @since 2022-06-05
 */
let
    Source = T8R_SOURCE_FILES_WORKBOOKS,
    #"Removed Other Columns" = Table.SelectColumns(
        Source,
        {"Name"}
    ),
    // Convert to Record?
    FilePath = #"Removed Other Columns"[Name]
in
    FilePath