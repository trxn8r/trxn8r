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

// T8R_TRXNS_WORKBOOK_PATH
/**
 * @since   2022-06-01
 * @version 2022-0-03
 */
let
    ConfigValue = T8R_CONFIG_MAIN[T8R_TRXNS_WORKBOOK_FILE]
in
    ConfigValue

// t8r_SourceWorkbook
/**
 * Used by [[t8r_GetWorksheetFromTrxnsWorkbook]]
 * Have to use raw code here, circular references trying some other weird things.
 *
 * @since 2022-06-02
 */
let
    // alias for painless debugging
    T8R_TRXNS_WORKBOOK_PATH = T8R_TRXNS_WORKBOOK_PATH,
    T8R_TRXNS_WORKSHEET_NAME = T8R_TRXNS_WORKSHEET_NAME,    
    //worksheet = t8r_GetWorksheetFromTrxnsWorkbook(T8R_TRXNS_WORKSHEET_NAME)
    Workbook = Excel.Workbook(
        File.Contents(T8R_TRXNS_WORKBOOK_PATH),
        false,
        true
    ),

    FinalStep = Workbook
in
    FinalStep

// t8r_GetSourceWorksheet_func
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
        worksheet = t8r_SourceWorkbook{[Name=worksheetName]},
        data = worksheet[Data]
    in
        data
in
    Source


    /* ALT, H, Q => ALT then H for Home Tab on Top Ribbon Bar, then Q for `Advanced Editor` #ProTip #Shortcut */

// t8r_SourceBalanceHistory
let
    Source = t8r_GetSourceWorksheet_func("BalanceHistory"),
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

// t8r_TrxnsWorksheet
let
    Workbook = t8r_SourceWorkbook,
    Worksheet = Workbook{[Name=T8R_TRXNS_WORKSHEET_NAME]},
    Data = Worksheet[Data],
    #"Promoted Headers" = Table.PromoteHeaders(Data, [PromoteAllScalars=true]),
    #"Removed Blank Rows" = Table.SelectRows(#"Promoted Headers", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Blank Rows",{{"Date", type date}, {"Amount", Currency.Type}}),
    #"Sorted Rows" = Table.Sort(#"Changed Type",{{"Date", Order.Ascending}})
in
    #"Sorted Rows"

// T8R_TRXNS_WORKSHEET_NAME
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
    CurrentTrxnsWorksheet = t8r_TrxnsWorksheet,
    ImportSourceRemapped = t8r_ImportSourceRemapped,
    TrxnsCombined =
        Table.Combine(
            {
                Table.AddColumn(
                    CurrentTrxnsWorksheet,
                    "IsFromImport",
                    each 0,
                    type binary
                ),
                Table.AddColumn(
                    ImportSourceRemapped,
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

// t8r_ImportFilesTrxnsCombined
/**
 * ImporterFileContentsCombined
 *
 * @since 2022-05-??
 * @version 2022-06-04
 */
let
    Config = t8r_ImportConfigCurrent,    
    TransformerName = Config[TransformerName],
    t8r_ImportFilesFiltered = t8r_ImportFilesFiltered,
    sharedDump = #shared,
    FilesRenamedCols = Table.RenameColumns(
            t8r_ImportFilesFiltered,
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
    #"Load File Contents by Invoking Transform File" =
        Table.AddColumn(
            FilesRenamedCols,
            "Transform File",
            each
                // Invoke default Transform function, which is likely good for 80% of use cases.
                //if #"Renamed File Columns" = null then
                if (TransformerName = null) then
                    #"Transform File"([Content])
                    // Allow people to build up filters or chains of functions through excel?
                    // or is it better having people play in Power Query Editor (yes, I think so..., but I am objectively "weird").
                else
                    // Expression.Evaluate(TransformerName & "(" & [Content] & ", " & [File.name] & ")", #shared)

                    //Expression.Evaluate(TransformerName & "(" & [Content] & ", " & [File.name] & ")", #shared)
                    Expression.Evaluate(TransformerName & "(" & [Content] & ", " & [File.name] & ")", Record.Combine(
                        [
                            {
                                "TransformerParams",
                                _
                            }
                            // this is dumb - could just pass the function the whole table...thinking record-by-record, old-school...ewww.
                        
                        ],
                        #shared
                    )

                    // Check [[test-1-SmokeTest]] for similar Evaluate usage.
                    /*                                  
                    > # Expression.Evaluate 
                    > ## [](https://docs.microsoft.com/en-us/powerquery-m/expression-evaluate#syntax)Syntax
                    > 
                    > <pre>Expression.Evaluate(**document** as text, optional **environment** as nullable record) as any
                    > </pre>
                    > 
                    > ## [](https://docs.microsoft.com/en-us/powerquery-m/expression-evaluate#about)About
                    > 
                    > Returns the result of evaluating an M expression `document`, with the available identifiers that can be referenced defined by `environment`.
                    >
                    > -- https://docs.microsoft.com/en-us/powerquery-m/expression-evaluate#expressionevaluate 
                    */
                    
                    
                    /*
                    Second Argument to Expression.Evaluate(text, ...) for `environment` is important!
                    Without it:

                        Expression.Error:
                            [1,1-1,22]
                            The name 'TransformFileFromCIBC' doesn't exist in the current context.
                        Details:
                            [List]

                    > Knowing, that there is a global environment might make you think what is part of it. If you want to see the components of the global environment, you can use the (so called) _intrinsic variable_ **#shared**. _#shared_ **returns** a **record** containing **all names** **and values** of all the queries (tables, constants, records, lists, native M functions, custom functions, etc.) in the current Excel/ Power BI Desktop file.
                    >
                    > -- https://ssbi-blog.de/blog/technical-topics-english/the-environment-concept-in-m-for-power-query-and-power-bi-desktop-part-3/#attachment_1964
                    */
                    
        ),
    #"Removed Other Columns from File" =
        Table.SelectColumns(
            #"Load File Contents by Invoking Transform File",
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
    // Default PQ "Remove Blank Rows" code.
    #"Removed Blank Rows" = Table.SelectRows(
        #"Expanded File Contents",
        each not List.IsEmpty(
            List.RemoveMatchingItems(Record.FieldValues(_), {"", null})
        )
    ),
    /* 2022-06-04 Leaving out due to [[Headerless CSV Files]]
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
            #"Removed Blank Rows",
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
        */
    LastStep = #"Removed Blank Rows"
in
    LastStep

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
    #"Converted to Table" = Record.ToTable(ImportSourceHeadersMap),
    HeadersMapNoNullsTable = Table.SelectRows(#"Converted to Table", each [Value] <> null and [Value] <> ""),
    #"Transposed Table" = Table.Transpose(HeadersMapNoNullsTable),
    #"Promoted Headers" = Table.PromoteHeaders(#"Transposed Table", [PromoteAllScalars=true]),
    // Renames = Table.ToList(#"Promoted Headers"),

    // HeadersMapNoNulls = Record.Select(#"Filtered Rows", each _ <> null),





    /* example record could be `Amount = Transfer` */
    
    //    NewNames = {"Last Week Sales","Two Weeks Ago","Three Weeks Ago"},
    //     Renames = List.Zip({OldNames,NewNames}),
    // Custom2 = Table.RenameColumns(Base,Renames),
    // https://docs.microsoft.com/en-us/powerquery-m/table-selectrows
    // Renames = List.Zip({
    //     Record.FieldValues(#"Promoted Headers"),
    //     Record.FieldNames(#"Promoted Headers")
    // }),


 Renames = List.Zip({
        HeadersMapNoNullsTable[Value],
        HeadersMapNoNullsTable[Name]
    }),
    

    
    //  Renamed All Columns of ImportSourceAlias to Match t8r_ImportSourceHeadersMap
    RenameColumns = Table.RenameColumns(
        ImportSourceRecords,
        Renames,
        null      
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

// T8R_IMPORT_CONFIGS_TABLE_NAME
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
    Source = t8r_GetWorksheet(T8R_IMPORT_CONFIGS_TABLE_NAME),
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


    /*
    AddRenamesList = Table.AddColumn(
        #"Changed Type",
        "RenamesList",
        
 Renames = List.Zip({
        [Columns],
        HeadersMapNoNullsTable[Name]
    }),


    

    
    //  Renamed All Columns of ImportSourceAlias to Match t8r_ImportSourceHeadersMap
    RenameColumns = Table.RenameColumns(
        ImportSourceRecords,
        Renames,
        null      
    ),
    )    */
            //not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))
            
in
    #"Changed Type"

// t8r_ImportConfigCurrent
/**
 * t8r_ImportConfigCurrent
 *
 * Using record instead of table for easier access from things like [[t8r_ImportFilesFiltered]]
 *
 * @since   2022-06-03
 * @version 2022-06-03
 */
let
    // params
    T8R_IMPORT_CONFIG_NAME_TO_USE = T8R_IMPORT_CONFIG_NAME_TO_USE,
    t8r_ImportConfigs = t8r_ImportConfigs,

    // logic
    FindConfig = Table.SelectRows(
        t8r_ImportConfigs,
        each [ConfigName] = T8R_IMPORT_CONFIG_NAME_TO_USE
    ),

    Config = FindConfig{0}
in
    Config

/*
## Known Issues

1. An error occurred in the ‘t8r_GetConfigValue’ query. Expression.Error: A cyclic reference was encountered during evaluation.

Happens when ...2022-06-03

*/

// T8R_IMPORT_CONFIG_NAME_TO_USE
/**
 * T8R_IMPORT_CONFIG_NAME_TO_USE
 *
 * Defaults to the first config if the specified one cannot be found.
 *
 * @version 2022-06-02
 * @since   2022-06-01
 */
let   
    // set alias for the "Steps Navigator" clarity/debugging.
    Config = T8R_CONFIG_MAIN,
    
    // Get config name from the main worksheet (just move to a property in the table).
    // it is a string, not a constant, that's what the variable name is on the woksheet is all.
    ImportConfigName = Config[T8R_IMPORT_CONFIG_NAME]
in
    ImportConfigName

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
    t8r_CurrentImportConfig = t8r_ImportConfigCurrent,
    tempSourceTrxns = t8r_TrxnsWorksheet,
    trxnsColumns = Table.ColumnNames(tempSourceTrxns),
    
    /* logic
    #"Columns from ImportConfig that match Transactions Worksheet" = Table.SelectColumns(
        tempSourceTrxns,
        List.(t8r_CurrentImportConfig),
        MissingField.UseNull
    
    ),
 */
    // #"Columns from ImportConfig that match Transactions Worksheet" = List.Zip(
    //     t8r_CurrentImportConfig,
    //     trxnsColumns
    // )
    // https://docs.microsoft.com/en-us/powerquery-m/record-selectfields
    
    /*
    https://docs.microsoft.com/en-us/powerquery-m/record-selectfields
    > Record.SelectFields(record as record, fields as any, optional missingField as nullable number) as record    
    > Returns a record which includes only the fields specified in list fields from the input record.
    */

    #"Columns from ImportConfig that match Transactions Worksheet" = Record.SelectFields(
        t8r_CurrentImportConfig,
        trxnsColumns,
        null
    )
in
    #"Columns from ImportConfig that match Transactions Worksheet"

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

// t8r_TrxnsFromImport
let
    Source = t8r_TrxnsAfterImportAll,
    #"Filtered Rows" = Table.SelectRows(Source, each [File.Name] <> null and [File.Name] <> ""),
    #"Sorted Rows" = Table.Sort(#"Filtered Rows",{{"Date", Order.Ascending}})
in
    #"Sorted Rows"

// T8R_IMPORT_DIR
/**
 * T8R_IMPORT_DIR
 *
 * @since   2022-06-01
 * @version 2022-06-03
 */
let
    Config = T8R_CONFIG_MAIN,
    ConfigValue = Config[T8R_IMPORT_DIR]
in
    ConfigValue

// t8r_ImportFilesAll
let
    // Alias Paramaters for for easy dumping through PQ Steps Editor
    dirPath = T8R_IMPORT_DIR,   
    // List all Files in Import Directory
    Source = Folder.Files(dirPath),
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
    FilesAll = t8r_ImportFilesAll

    
in
    FilesAll

// t8r_ImportFilesWithConfig
/**
 * t8r_ImportFilesTransformed
 *
 * @since 2022-06-04
 * @version 2022-06-04
 */
let
    Source = t8r_ImportFilesFiltered,

    // https://support.microsoft.com/en-us/office/create-a-fuzzy-match-power-query-ffdd5082-c0c8-4c8e-a794-bd3962b90649
    #"Merged Queries" = Table.FuzzyNestedJoin(Source, {"Name"}, t8r_ImportConfigs, {"FileNameMatches"}, "t8r_ImportConfigs", JoinKind.LeftOuter, [IgnoreCase=true, IgnoreSpace=false, NumberOfMatches=1, Threshold=0.2]),
    #"Renamed Columns" = Table.RenameColumns(#"Merged Queries",{{"t8r_ImportConfigs", "Config"}}),
    #"Expanded Config" = Table.ExpandTableColumn(#"Renamed Columns", "Config", {"ConfigName", "Note", "FileNameMatches", "UseFirstRowAsHeaders", "Columns", "FolderPath", "TransformerName", "RemainingFieldsAreDynamic", "Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Month", "Week", "Check Number", "Full Description", "Transaction ID", "Account ID", "Date Added", "slug"}, {"Config.ConfigName", "Config.Note", "Config.FileNameMatches", "Config.UseFirstRowAsHeaders", "Config.Columns", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"}),
    #"Reordered Columns" = Table.ReorderColumns(#"Expanded Config",{"Config.ConfigName", "Config.FileNameMatches", "Config.UseFirstRowAsHeaders", "Content", "Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"}),

    SelectFilesWithConfig = Table.SelectRows(#"Reordered Columns", each [Config.ConfigName] <> null)    
in
    SelectFilesWithConfig

// t8r_ImportFilesWithCsvDoc
/**
 * t8r_ImportFilesTransformed
 *
 * Errors? #Troubleshoot by checking `Config.FileNameMatches`, if null, something wrong with merge in [[t8r_ImportFilesWithConfig]]
 *
 * @since 222-06-04
 */
let
    Files = t8r_ImportFilesWithConfig,
    #"Renamed Columns" = Table.RenameColumns(Files,{{"Name", "File.Name"}}),
    // #shared is a Record
    debug_Shared = #shared,
    debug_Shared2 = Record.AddField(
        #shared,
        "_CurrentImportSampleFile",
        "foo"
    ),
    AddCsvDoc = Table.AddColumn(
        #"Renamed Columns",
        "CsvDoc",
        each t8r_TransformCsv_func(
            [Content],
             // Csv.Document(...) options
            Text.Split([Config.Columns], ","),
            [Config.UseFirstRowAsHeaders] // Use FirstRowAsHeaders
            
        )
    ),
    RemapCsvDoc = Table.AddColumn(
        AddCsvDoc,
        "CsvDocMapped",
        each t8r_RemapCsv_func([CsvDoc])
    ),
    #"Reordered Columns" = Table.ReorderColumns(
        RemapCsvDoc,
        {"CsvDoc", "Config.ConfigName", "Config.UseFirstRowAsHeaders", "Config.Columns", "Config.FileNameMatches", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Reordered Columns",{{"Config.Columns", type text}}),
    #"Reordered Columns1" = Table.ReorderColumns(#"Changed Type",{"CsvDocMapped", "CsvDoc", "Config.ConfigName", "Config.UseFirstRowAsHeaders", "Config.Columns", "Config.FileNameMatches", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"})
    
    // ,
    // #"Changed Type" = Table.TransformColumnTypes(AddCSV,{{"TransformFileResult", type binary}}),
    // #"Replaced Value" = Table.ReplaceValue(#"Changed Type", null,"transformFileDefault",Replacer.ReplaceValue,{"Config.TransformerName"}),
    // #"Reordered Columns" = Table.ReorderColumns(#"Replaced Value",{"TransformFileResult", "Config.ConfigName", "Config.FileNameMatches", "Content", "Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"})
in
    #"Reordered Columns1"

// t8r_TransformCsv_func
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

// t8r_ImportFilesWithCsvDocTransformersInvoked
let
    Source = t8r_ImportFilesWithCsvDoc,
    // Run Custom Transformers
    Transformed = Table.AddColumn(
        Source,
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
    #"Reordered Columns" = Table.ReorderColumns(Transformed,{"CsvDocTransformed", "CsvDocMapped", "CsvDoc", "Config.ConfigName", "Config.UseFirstRowAsHeaders", "Config.Columns", "Config.FileNameMatches", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"})
in
    #"Reordered Columns"

// t8r_ImportFilesWithCsvDocNormalized
let
    Source = t8r_ImportFilesWithCsvDocTransformersInvoked,
    #"Removed Columns" = Table.RemoveColumns(Source,{"CsvDocMapped", "CsvDoc"}),
    Normalized = Table.AddColumn(
        #"Removed Columns",
        "CsvNormalized",
        each t8r_NormalizeCsvDoc_func([CsvDocTransformed])
    ),
    #"Reordered Columns" = Table.ReorderColumns(Normalized,{"CsvNormalized", "CsvDocTransformed", "Config.ConfigName", "Config.UseFirstRowAsHeaders", "Config.Columns", "Config.FileNameMatches", "Content", "File.Name", "Extension", "Date accessed", "Date modified", "Date created", "Attributes", "Folder Path", "ShouldImport", "Config.Note", "Config.FolderPath", "Config.TransformerName", "Config.RemainingFieldsAreDynamic", "Config.Date", "Config.Description", "Config.Category", "Config.Amount", "Config.Account", "Config.Account #", "Config.Institution", "Config.Month", "Config.Week", "Config.Check Number", "Config.Full Description", "Config.Transaction ID", "Config.Account ID", "Config.Date Added", "Config.slug"})
in
    #"Reordered Columns"

// t8r_TrxnsHeadersList
/**
 * t8r_TrxnsHeadersList
 * 
 * @since 
 */
let
    SourceTrxns = t8r_TrxnsWorksheet,
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

// t8r_NormalizeCsvDoc_func
/**
 * Invoked by [[t8r_ImportFilesWithCsvDocNormalized]]
 *
 * @since   2022-06-04
 * @version 2022-06-04
 */
let
    t8r_NormalizeCsvDoc_func = (CsvDoc) =>
    
    let  NormalizedCols = Table.SelectColumns(
        CsvDoc,
        t8r_TrxnsHeadersList,
        MissingField.UseNull  
    )
    in NormalizedCols
in
    t8r_NormalizeCsvDoc_func

// t8r_ImportCsvTrxns_FINAL
let
    Source = t8r_ImportFilesWithCsvDocNormalized,
    #"Removed Other Columns" = Table.SelectColumns(Source,{"CsvNormalized"}),
    #"Expanded CsvNormalized" = Table.ExpandTableColumn(#"Removed Other Columns", "CsvNormalized", {"Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Month", "Week", "Check Number", "Full Description", "Transaction ID", "Account ID", "Date Added", "slug"}, {"Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Month", "Week", "Check Number", "Full Description", "Transaction ID", "Account ID", "Date Added", "slug"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded CsvNormalized",{{"Date", type date}})
in
    #"Changed Type"

// t8r_ImportFilesParsed
let
    Source = t8r_ImportFilesWithConfig,
    Shared = #shared,
    /* maybe...functions are harder to debug with Applied Steps Navigator 
    SourceTransformed = t8r_TransformFiles_func(
        t8r_ImportFilesWithConfig
    )
    */
      #"Load File Contents by Invoking Transform File" =
        Table.AddColumn(
            Source,
            "Transform File",
            each
                // Invoke default Transform function, which is likely good for 80% of use cases.
                //if #"Renamed File Columns" = null then
                if ([Config.TransformerName] = null) then
                    #"Transform File"([Content])
                    // Allow people to build up filters or chains of functions through excel?
                    // or is it better having people play in Power Query Editor (yes, I think so..., but I am objectively "weird").
                else
                    // Expression.Evaluate(TransformerName & "(" & [Content] & ", " & [File.name] & ")", #shared)

                    //Expression.Evaluate(TransformerName & "(" & [Content] & ", " & [File.name] & ")", #shared)
                    Expression.Evaluate([Config.TransformerName] & "(" & [Content] & ", " & [File.name] & ")", Record.Combine(
                        [
                            {
                                "TransformerParams",
                                _,                                
                            }
                            // this is dumb - could just pass the function the whole table...thinking record-by-record, old-school...ewww.
                        
                        ],
                        Shared
                    )

                    // Check [[test-1-SmokeTest]] for similar Evaluate usage.
                    /*                                  
                    > # Expression.Evaluate 
                    > ## [](https://docs.microsoft.com/en-us/powerquery-m/expression-evaluate#syntax)Syntax
                    > 
                    > <pre>Expression.Evaluate(**document** as text, optional **environment** as nullable record) as any
                    > </pre>
                    > 
                    > ## [](https://docs.microsoft.com/en-us/powerquery-m/expression-evaluate#about)About
                    > 
                    > Returns the result of evaluating an M expression `document`, with the available identifiers that can be referenced defined by `environment`.
                    >
                    > -- https://docs.microsoft.com/en-us/powerquery-m/expression-evaluate#expressionevaluate 
                    */
                    
                    
                    /*
                    Second Argument to Expression.Evaluate(text, ...) for `environment` is important!
                    Without it:

                        Expression.Error:
                            [1,1-1,22]
                            The name 'TransformFileFromCIBC' doesn't exist in the current context.
                        Details:
                            [List]

                    > Knowing, that there is a global environment might make you think what is part of it. If you want to see the components of the global environment, you can use the (so called) _intrinsic variable_ **#shared**. _#shared_ **returns** a **record** containing **all names** **and values** of all the queries (tables, constants, records, lists, native M functions, custom functions, etc.) in the current Excel/ Power BI Desktop file.
                    >
                    > -- https://ssbi-blog.de/blog/technical-topics-english/the-environment-concept-in-m-for-power-query-and-power-bi-desktop-part-3/#attachment_1964
                    */
                    
        ),
    
in
    Source

// t8r_ImportSourceHeaders
let
    Source = t8r_ImportSourceDataShortcut,
    ColNames = Table.ColumnNames(Source),
    #"Converted to Table" = Table.FromList(ColNames, Splitter.SplitByNothing(), null, null, ExtraValues.Ignore),
    #"Renamed Columns" = Table.RenameColumns(#"Converted to Table",{{"Column1", "SourceHeaderName"}})
in
    #"Renamed Columns"

// t8r_GetImportConfigValue_FUNC
let
   
    // T8R_CURRENT_IMPORT_CONFIG = T8R_CURRENT_IMPORT_CONFIG,

    // alias for "Applied Steps" Navigator for easy #debug and #demo
    // Keep before or after the function declaration so it shows in Applied Steps.
    // Inner steps of functions DO NOT show up on Applied Steps.

    T8R_CONFIG_WORKSHEET = T8R_CONFIG_WORKSHEET,    // looks like overall config.
    ImportConfigs = t8r_ImportConfigs,
    CurrentConfig = t8r_ImportConfigCurrent,
    // TestVar = t8r_ImportConfigCurrent[fileNamePattern],
    // @version 2022-06-02
    GetImportConfigValue = (configKey) => let
        /*
        // Value = CurrentConfig[configKey]        
        That shorter reference SURPRISINGLY does not work.
        
        https://docs.microsoft.com/en-us/powerquery-m/record-field        
        > Record.Field(record as record, field as text) as any
        > Returns the value of the specified field in the record. If the field is not found, an exception is thrown.
        */
        Value = Record.Field(CurrentConfig, configKey)
    in
        Value
in
    GetImportConfigValue


/*

            // = false since it has the shortest lines of code in the statement (easier to read #BestPractice)
            if (Table.IsEmpty(SelectedRows) = false) then
                
            else 
                error Error.Record(
                    "No Config Found",
                    "No configuration was found. arguments.configName: " & configName
                )
                
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
*/

// t8r_ImportConfigsAsListForParamsOptions
let
    Source = t8r_ImportConfigs,
    #"Removed Other Columns" = Table.SelectColumns(Source,{"ConfigName"}),
    configName = #"Removed Other Columns"[ConfigName]
in
    configName

// Sample File
let
    Source = t8r_ImportFilesFiltered,
    Navigation1 = Source{0}[Content]
in
    Navigation1

// Transform File SampleFileParam
#"Sample File" meta [IsParameterQuery=true, BinaryIdentifier=#"Sample File", Type="Binary", IsParameterQueryRequired=true]

// TransformFileDefault
let
    Source = (#"Transform File SampleFileParam" as binary) => let
        Source = Csv.Document(#"Transform File SampleFileParam",[Delimiter=",", Columns=4, Encoding=1252, QuoteStyle=QuoteStyle.None]),
        #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
    in
        #"Promoted Headers"
in
    Source

// Transform Sample File
let
    Source = Csv.Document(#"Transform File SampleFileParam",[Delimiter=",", Columns=4, Encoding=1252, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
in
    #"Promoted Headers"

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

// t8r_SourceWorkbookWorksheetNamesList
let
    Source = t8r_SourceWorkbook,
    #"Keep Name Column Only" = Table.SelectColumns(Source,{"Name"}),
    Name = #"Keep Name Column Only"[Name]
in
    Name

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

// test-1-SmokeTest
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

// dev-smoketest-i-think
let
        Results = #table(
            { "name", "result" },
            {
                { "T8R_IMPORT_CONFIG_NAME_TO_USE", T8R_IMPORT_CONFIG_NAME_TO_USE },
                { "t8r_ImportConfigs", t8r_ImportConfigs },
                { "t8r_ImportConfigsAsListForParamsOptions", t8r_ImportConfigsAsListForParamsOptions },
                { "t8r_ImportConfigCurrent", t8r_ImportConfigCurrent },
                // copy/pasted from group T8R_CONFIG_PROCESSING
                { "T8R_CONFIG_EXCEL_TABLE_NAME", T8R_CONFIG_EXCEL_TABLE_NAME },
                { "T8R_CONFIG_WORKSHEET", T8R_CONFIG_WORKSHEET },
                { "T8R_CONFIG_MAIN", T8R_CONFIG_MAIN },
                { "T8R_IMPORT_CONFIGS_TABLE_NAME", T8R_IMPORT_CONFIGS_TABLE_NAME },
                { "t8r_GetImportConfigValue", t8r_GetImportConfigValue_FUNC },
                { "T8R_TRXNS_WORKBOOK_PATH", T8R_TRXNS_WORKBOOK_PATH },
                { "T8R_TRXNS_WORKSHEET_NAME", T8R_TRXNS_WORKSHEET_NAME },
                // end
                { "T8R_IMPORT_CONFIG_NAME_TO_USE", T8R_IMPORT_CONFIG_NAME_TO_USE }
            }
        )   // end #table(cols, records)
in
    Results

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

// try Invoking Weird Format
let
    Source = #shared,
    #"Converted to Table" = Record.ToTable(Source),
    #"Filtered Rows" = Table.SelectRows(#"Converted to Table", each ([Name] = "Transform File" or [Name] = "Transform Sample File" or [Name] = "TransformFileFromCIBC")),

    TestResult = #shared[TransformFileFromCIBC]()
in
   TestResult

// t8r_ImportFilesFiltered BACKUP 2022-06-04
let
    // Alias Paramaters for for easy dumping through PQ Steps Editor
    FilesAll = t8r_ImportFilesAll,

    // fileNamePattern = T8R_CURRENT_IMPORT_CONFIG[fileNamePattern],
    fileNamePattern = t8r_GetImportConfigValue_FUNC("FileNameContains"),
    /*
    Filter files to only ones we want.
    Future hoping to parse JSON, Excel, whatever PQ can handle, plus APIs hopefully. Maybe direct Yodlee integration.

    TODO: This should consider `t8r_ImportConfigs` file name pattern.
    */
    #"Filtered Rows by Config Value" = Table.SelectRows(
        FilesAll,
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
        #"Filtered Rows by Config Value",
        "ShouldImport",
        each true,
        type logical
    )
in
    #"Added Custom"

// t8r_ImportFilesWithCsvDoc SAMPLE FILE
let
    Source = #"t8r_ImportFilesWithCsvDoc",
    #"Kept First Rows" = Table.FirstN(Source,1),
    #"Removed Other Columns" = Table.SelectColumns(#"Kept First Rows",{"CsvDoc"}),
    #"Invoked Custom Function" = Table.AddColumn(#"Removed Other Columns", "TransformFileFromCIBC", each TransformCsvFromCIBC([CsvDoc])),
    #"Expanded TransformFileFromCIBC" = Table.ExpandTableColumn(#"Invoked Custom Function", "TransformFileFromCIBC", {"Date", "Description", "Withdrawal", "Deposit", "Amount"}, {"TransformFileFromCIBC.Date", "TransformFileFromCIBC.Description", "TransformFileFromCIBC.Withdrawal", "TransformFileFromCIBC.Deposit", "TransformFileFromCIBC.Amount"}),
    CsvDoc = #"Expanded TransformFileFromCIBC"{0}[CsvDoc]
in
    CsvDoc

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

// BalanceHistory
let
    Source = Excel.Workbook(File.Contents("W:\src\trxn8r-data\samples\Tiller-Foundation-Template.sample1.with-dummy-trxns - Copy (2).xlsx"), null, true),
    BalanceHistory_Table = Source{[Item="BalanceHistory",Kind="Table"]}[Data]
in
    BalanceHistory_Table

// Transactions1
let
    Source = Excel.Workbook(File.Contents("W:\src\trxn8r-data\samples\Tiller-Foundation-Template.sample1.with-dummy-trxns - Copy (2).xlsx"), null, true),
    Transactions_Table = Source{[Item="Transactions",Kind="Table"]}[Data]
in
    Transactions_Table

// Categories2
let
    Source = Excel.Workbook(File.Contents("W:\src\trxn8r-data\samples\Tiller-Foundation-Template.sample1.with-dummy-trxns - Copy (2).xlsx"), null, true),
    Categories_Table = Source{[Item="Categories",Kind="Table"]}[Data]
in
    Categories_Table