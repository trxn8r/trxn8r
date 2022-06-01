/**
 * t8r_ImportConfigs
 *
 * Mix of "real" data and Headers Dynamically `[[TRANSPOSED]]` for mapping.
 *
 * @since 2022-05-31
 * @version 2022-05-31
 */
let
    T8rConfigsWSName = T8R_CONFIGS_WS_NAME,

    Source = Excel.CurrentWorkbook(){[Name=T8R_CONFIGS_WS_NAME]}[Content],

    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Removed Blank Rows" = Table.SelectRows(#"Promoted Headers", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),

    FinalStep = #"Removed Blank Rows"
in
    FinalStep