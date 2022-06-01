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
    Source =
        Table.Combine(
            {
                Table.AddColumn(
                    t8r_SourceTrxnsWorksheet2,
                    "Is\searchFromImport",
                    each 0,
                    type binary
                ),
                Table.AddColumn(
                    t8r_ImportSourceNormalized,
                    "IsFromImport",
                    each 1,
                    type binary
                )
            }
        ),
    #"Changed Type: Amount to Currency" =
        Table.TransformColumnTypes(
            Source,
            {
                {
                    "Amount",
                    Currency.Type
                }
            }
        ),
    // NEED A SLUG COLUMN NOW! Assuming we have it. Should be from ImportConfig.
    #"Generate Slugs for NULLs with createSlug(...)" =
        Table.ReplaceValue(
            #"Changed Type: Amount to Currency",
            "",
            // DEBUG dummy value instead of createSlug function.
            // Comment out above and insert string instead.
            // "t8rDebug_SLUG",
            "createSlug(
                [Date],
                _[Amount],
                _[Description]
            )",
            Replacer.ReplaceValue,
            {"slug"}
        ),
    #"Backup slug as originalSlug for upcoming NULL replacements (#BetterWay ?)" =
        Table.RenameColumns(
            #"Generate Slugs for NULLs with createSlug(...)",
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
    #"Removed Duplicates" =
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

    // FinalStep to avoid issues with trailing commas when editing code :) #HappyDev
    FinalStep = #"Removed Duplicates"
in
    FinalStep