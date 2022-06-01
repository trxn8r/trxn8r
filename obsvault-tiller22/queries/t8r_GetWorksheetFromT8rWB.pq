/**
 * t8r_GetWorksheetFromT8rWB
 * Created for "t8r_ImportConfigs"
 * @since 2022-0-31
 */
let
    // @version 2022-05-31
    Source = (worksheetName) => let

        /*
        #WARNING: `CurrentWorkbook(...` has a `Data` key,
        while `Excel.Workbook(...` returns a ``... the same?

        I might have been wrong.

        Thought that it was different than what loading an External Workbook does.

        @related [[t8r_GetWorksheetFromMainWB]]
        */
        worksheetData = Excel.CurrentWorkbook(){[Name=worksheetName]}[Data]
    in
        worksheetData
in
    Source