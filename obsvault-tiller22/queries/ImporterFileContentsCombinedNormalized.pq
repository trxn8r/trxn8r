/**
 * ImporterFileContentsCombinedNormalized
 *
 * Now we have `ImporterFileContentsCombined`, a query resulting in a bundle
 * of all the Files, which v1 is only looking at CSV files.
 * That **Query Result (`ImporterFileContentsCombined`)** has cols matching file headings.
 *
 * Now, let us **Remap/rename the file contents bundle** for
 * **easy merging/combining/comparing** to the `Transactions
 *
 * #ThankYou for List.Zip and more
 * https://www.youtube.com/watch?v=wSwXyfaXQgU
 *
 * @since 2022-05-26
 * @see   `ImporterTransactionsFinalWithDupes.m`
 */
let
    Source = ImporterFileContentsCombined,
    Config = ImportSourceHeaderRenames,
    /* example record could be `Amount = Transfer` */
    Renames = List.Zip({
        Record.FieldValues(Config) ,
        Record.FieldNames(Config)
    }),
    #"Renamed Columns" = Table.RenameColumns(
        ImportSource,
        Renames
    ),
    #"Invoked Custom Function" = Table.AddColumn(#"Renamed Columns", "slug", each createSlug([Date], [Amount], [Description]))
in
    #"Invoked Custom Function"

//    NewNames = {"Last Week Sales","Two Weeks Ago","Three Weeks Ago"},
//     Renames = List.Zip({OldNames,NewNames}),
    // Custom2 = Table.RenameColumns(Base,Renames),
