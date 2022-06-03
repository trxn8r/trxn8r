/**
 * ImporterFileContentsCombined
 * ImporterTrxnsNew
 * TrxImportNewTrxns
 *
 * Kicked off renaming tables, project, etc...
 * So, thank you for the "Trxinator" :)
 *
 * @since 2022-05-26
 * @author gitgreg@stevens.pro
 */

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




/* RENAMING SUGGESTIONS

ImporterSourceRows
ImporterSourceRecords
ImporterTransactionsSource    with    ImporterTransactionsDest (= Transactions)

// keeping in mind importing Accounts, Balance History, Account Statements, etc.

ImporterSourceTxns
ImporterDestTxns

yep... TXNS it is!

> # What does **TXNS** mean in **Banking**?
>
> #### This page is about the meanings of the acronym/abbreviation/shorthand **TXNS** in the **Business** field in general and in the **Banking** terminology in particular.
>
> -- https://www.abbreviations.com/#print-style-icon

but...I keep typing TRXNS (with an R)...

Lol, okay after reading full list from www.abbreviations.com, I know!!!

> TRX, TRXs

Because `TRX` is like `T-Rex`, a `Dinosaur`,
like a `Tiny Dinosaur (Bearded Dragon)`.
Perfect for a thing called the `Lizinator`

Whoa...maybe it should be called the `Dinonator` ??

Dinonator 2022 sounds pretty sweet.

But what about a link to finance?

Think about it while I pee...


GOT IT! after a few times and some interesting searches:

#LinkDump 26/05/2022, 14:10:50

- [excel tables power query best practices - Google Search](https://www.google.com/search?q=excel+tables+power+query+best+practices&sxsrf=ALiCzsYwWJvsNa1zfm6uM5M0AIZwh6_XQg%3A1653494245172&ei=5VGOYvWRCoLAuvQPwMSq4AQ&oq=excel+tables+power+query+bes&gs_lcp=Cgdnd3Mtd2l6EAMYADIFCCEQoAEyBAghEBUyCAghEB4QFhAdMggIIRAeEBYQHTIICCEQHhAWEB0yCAghEB4QFhAdOgoIIxCwAxAnEIsDOgoIABBHELADEIsDOgYIABAeEBZKBAhBGABKBAhGGABQ1wtY0RFg8x1oAnABeACAAXqIAaMCkgEDMi4xmAEAoAEByAEJuAECwAEB&sclient=gws-wiz)
- [Best practices when working with Power Query - Power Query | Microsoft Docs](https://docs.microsoft.com/en-us/power-query/best-practices)
- [Chris Webb's BI Blog: Naming Tables, Columns And Measures In Power BI Chris Webb's BI Blog](https://blog.crossjoin.co.uk/2020/06/28/naming-tables-columns-and-measures-in-power-bi/)
- [power query view export all query text source - Google Search](https://www.google.ca/search?q=power+query+view+export+all+query+text+source&btnK=Google+Search&sxsrf=ALiCzsY4d82jz3_0BWREkdpmXRKWfSCCBw%3A1652500249807&source=hp&ei=GSd_YtizLpaB0PEP7cqdiAw&iflsig=AJiK0e8AAAAAYn81KZVZ4VNAEEMjF5j1P1MJsn-2jYdF&ved=0ahUKEwiYpIOTi973AhWWADQIHW1lB8EQ4dUDCA8&oq=tiller+transactions+cumulative+chart&gs_lcp=Cgdnd3Mtd2l6EAwyBwghEAoQoAFQAFgAYLYNaABwAHgAgAF1iAF1kgEDMC4xmAEAoAECoAEB&sclient=gws-wiz)
- [Chris Webb's BI Blog: Exporting Your Queries’ M Code From Power Query And Power BI Using Copy/Paste Chris Webb's BI Blog](https://blog.crossjoin.co.uk/2017/02/25/exporting-your-queries-m-code-from-power-query-and-power-bi-using-copypaste/)
- [Table.SelectRows - PowerQuery M | Microsoft Docs](https://docs.microsoft.com/en-us/powerquery-m/table-selectrows)
- [TXNS - Transactions](https://www.abbreviations.com/term/1493093)


- [x] Trx
- [ ] Combinator
- [ ] TabMaster 3000 is coolk
- Daltron 3000 is a great song, by an amazing artist.
- Tabinator 5000 (or whatever it was) is cool
- So Somethinginator is a good thing....

So...

Dinonator

FinoDino -- no.

Right...winner...



### Trxinator
(Transactionator) ✅✅✅


- Have a Jurassic Park themed where needed, after Dinosaurs, and Tiny Dinosaurs (Bearded Dragon and alike)
- Sadly goes away from a Tiller theme, but...whatever.


Although...


"Power Tiller" for "Power Query" does sound pretty good.
More of a movement though, something to come from Tiller officially.
After testing Power Query support across Macs, various licensing.

TODO: Makeup matrix of Excel's Power Query support across various platforms.

Better yet, make it in Power BI ;)




TXN
Transaction

Business » Accounting
TRX
Transaction

Business » Accounting
TRXN
Transaction

Computing » Databases
TRANS
Transaction

Business » Accounting
TRSX
Transaction

Business » Banking
TXN
Transaction

Business » Banking
https://www.abbreviations.com/abbreviation/Transaction

*/

