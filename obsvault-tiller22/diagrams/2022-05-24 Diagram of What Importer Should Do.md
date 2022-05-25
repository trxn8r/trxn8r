---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==


# Text Elements
./data/2022-05-24/eqbank ^FH3z7uPJ

777888999 Details.csv ^QaVDloKh

EQBank.ca -> Download CSV
(Browser Download) ^b4CKQSl0

111222333 Details.csv ^CoQFhcDX

444555666 Details.csv ^ADWnQg0F

Power Query (PQ) in Excel ^5EY3g8Ns

PQ File Query
Pattern = `* Details.csv` ^KJVlSkoB

Excel ^Ww9ycXTh

`Combine Files` Process ^jCgyPSY6

[Import data from a folder with multiple files (Power Query)](https://support.microsoft.com/en-us/office/import-data-from-a-folder-with-multiple-files-power-query-94b8023c-2e66-4f6b-8c78-6a00041c90e4#:~:text=Combine%20and%20Transform%20Data%20To,select%20Combine%20%3E%20Combine%20and%20Load.) ^GmkfMbMm

ImportSourceRows
(w/ Source Cols) ^EL3Gt4vA

Table.Distinct by slug ^VQ03NPPh

// CreateSlugIfNull

createSlug(date, amount, description) ^KXXVzche

Transactions
(existing, standard cols, dynamic cols) ^CvVM8OZd

Table.Combine(
    Transactions,
    ImportSourceNormalized)

Add Column("IsFromImport", each (1 or 0), type binary)
     ^HWVsIxsU

let
    Source = Table.Combine({
        Table.AddColumn(Transactions, "IsFromImport", each 0, type binary),
        Table.AddColumn(ImportSourceNormalized, "IsFromImport", each 1, type binary)
    }),
    #"Changed Type" = Table.TransformColumnTypes(Source,{{"Amount", Currency.Type}}),
    #"Replaced Value" = Table.ReplaceValue(#"Changed Type","",
        // "createSlug(
        //     [Date],
        //     _[Amount],
        //     _[Description]
        // )",
        "asdf",
        Replacer.ReplaceValue, {"slug"}
    ),
    #"Renamed Columns" = Table.RenameColumns(#"Replaced Value",{{"slug", "originalSlug"}}),
    CreateSlugIfNull = Table.AddColumn(#"Renamed Columns", "slug", each if ([originalSlug] = null) then createSlug([Date], [Amount], [Description]) else [originalSlug]),
    #"Removed Columns" = Table.RemoveColumns(CreateSlugIfNull,{"originalSlug"}),
    #"Reordered Columns" = Table.ReorderColumns(#"Removed Columns",{"slug", "Date", "Description", "Category", "Amount", "Account", "Account #", "Institution", "Month", "Week", "Check Number", "Full Description", "Transaction ID", "Account ID", "Date Added", "IsFromImport", "Balance"}),
    // #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"Description", "Date", "Amount"}),
    #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"slug"})
in
    #"Removed Duplicates" ^0fTV65Xm

#"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"slug"}) ^S6ht7Lot

Alternate w/o slug (ewww?)... ^wePfiiDx

TransactionsAfterImportDistinct ^yBwu7RVu

Magic

- Combine `Transactions` and `ImportedTransactions`
- Generate `slug` from Date, Amount, Description (if not already set)
- Run `Table.Distinct(...)` on `slug`
-  ^nYFmlPhg

Magic ^ary7Y3Bq

// #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"Description", "Date", "Amount"}),
    #"Removed Duplicates" = Table.Distinct(#"Reordered Columns", {"slug"}) ^RhFnHoR2

All Rows from All Files
with the same File Format
combined as one big table ^RWGA4yyd

TRANSFORM ^HiJ4WyMU

EXTRACT ^UzzoW1xC

LOAD ^UVUgS4GD

What is the "Load"?? How do I get the new transactions into the Transactions table? ^pUsdWUQK

What is the "Load"?? How do I get the new transactions into the Transactions table? ^jQqSAQLX

User Copies New Transactions back to `Transactions` Filter. ^QjrNg8pP

The `slug` will prevent the previously imported Transactions from showing up again! ^V44NRHcT

Whyer is VALIDATION? ^CYcm62jP


# Embedded files
a82c8209f4aa63cf9102d3f4dc6d5eb619634c3b: [[_assets/2022-05-24 Power Query Cleaned Up Config Query - ImportSourceNormalized/Pasted Image 20220524225348_019.png]]

%%
# Drawing
```json
{
	"type": "excalidraw",
	"version": 2,
	"source": "https://excalidraw.com",
	"elements": [
		{
			"type": "arrow",
			"version": 3820,
			"versionNonce": 392978328,
			"isDeleted": false,
			"id": "-MzqKv-6PB10pChkqfp8o",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1859,
			"y": 2519.9830508474574,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 1179,
			"height": 19.983050847457434,
			"seed": 1394950963,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582154,
			"link": null,
			"startBinding": {
				"elementId": "UUdSMLnCw1yCo1P-pp4BF",
				"gap": 1,
				"focus": -0.5916955017301038
			},
			"endBinding": {
				"elementId": "-qtUng8hg1MkfE4hitN20",
				"gap": 20,
				"focus": 0.24451665312753862
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-1179,
					-19.983050847457434
				]
			]
		},
		{
			"type": "text",
			"version": 407,
			"versionNonce": 1371253907,
			"isDeleted": false,
			"id": "GmkfMbMm",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -300,
			"y": 660,
			"strokeColor": "#495057",
			"backgroundColor": "transparent",
			"width": 526,
			"height": 23,
			"seed": 70908,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208979,
			"link": "https://support.microsoft.com/en-us/office/import-data-from-a-folder-with-multiple-files-power-query-94b8023c-2e66-4f6b-8c78-6a00041c90e4#:~:text=Combine%20and%20Transform%20Data%20To,select%20Combine%20%3E%20Combine%20and%20Load.",
			"fontSize": 16,
			"fontFamily": 1,
			"text": "🌐[[Import data from a folder with multiple files (Power Query)]]",
			"rawText": "[Import data from a folder with multiple files (Power Query)](https://support.microsoft.com/en-us/office/import-data-from-a-folder-with-multiple-files-power-query-94b8023c-2e66-4f6b-8c78-6a00041c90e4#:~:text=Combine%20and%20Transform%20Data%20To,select%20Combine%20%3E%20Combine%20and%20Load.)",
			"baseline": 18,
			"textAlign": "center",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "🌐[[Import data from a folder with multiple files (Power Query)]]"
		},
		{
			"type": "arrow",
			"version": 2345,
			"versionNonce": 1522813928,
			"isDeleted": false,
			"id": "jJm0huuw1jwx9-Zt-p0mK",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -163.64212537485113,
			"y": -162.2235991808833,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 117.71385060724796,
			"height": 86.52145612770784,
			"seed": 776374131,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582136,
			"link": null,
			"startBinding": {
				"elementId": "C8hTvTiHgy9iNXqxGki_Y",
				"gap": 8.140095443584073,
				"focus": 0.06333748999455842
			},
			"endBinding": {
				"elementId": "jfGSLdrr6GJgt4MoFjEjd",
				"gap": 3.1136894632148753,
				"focus": -0.46309458243208845
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					117.71385060724796,
					86.52145612770784
				]
			]
		},
		{
			"type": "rectangle",
			"version": 863,
			"versionNonce": 895394355,
			"isDeleted": false,
			"id": "C8hTvTiHgy9iNXqxGki_Y",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -318.9636563387783,
			"y": -201.63641634854406,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 265.4546009410511,
			"height": 31.27272172407669,
			"seed": 1340257875,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "CoQFhcDX",
					"type": "text"
				},
				{
					"id": "jJm0huuw1jwx9-Zt-p0mK",
					"type": "arrow"
				},
				{
					"id": "6EjzrqlDcY7Sz8kOAhKK9",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 742,
			"versionNonce": 2052596456,
			"isDeleted": false,
			"id": "CoQFhcDX",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -313.9636563387783,
			"y": -195.00005548650572,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 255.45460094105113,
			"height": 18,
			"seed": 1971221491,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571230,
			"link": null,
			"fontSize": 16.028523980614974,
			"fontFamily": 3,
			"text": "111222333 Details.csv",
			"rawText": "111222333 Details.csv",
			"baseline": 15,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "C8hTvTiHgy9iNXqxGki_Y",
			"originalText": "111222333 Details.csv"
		},
		{
			"type": "rectangle",
			"version": 1122,
			"versionNonce": 1079108563,
			"isDeleted": false,
			"id": "06zN-X9YeYLjWK9Td6Pza",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -520.812285452178,
			"y": -436.7879037568064,
			"strokeColor": "#000000",
			"backgroundColor": "#fd7e14",
			"width": 1221,
			"height": 147,
			"seed": 64001235,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "b4CKQSl0"
				},
				{
					"id": "6EjzrqlDcY7Sz8kOAhKK9",
					"type": "arrow"
				},
				{
					"id": "lK6Lr_3UmmMQ_NNp-UCaW",
					"type": "arrow"
				},
				{
					"id": "-rPZ5XkQeT9cgeWJgDJuP",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 1120,
			"versionNonce": 286078685,
			"isDeleted": false,
			"id": "b4CKQSl0",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -515.812285452178,
			"y": -408.7879037568064,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 1211,
			"height": 91,
			"seed": 1931677395,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208979,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "EQBank.ca -> Download CSV\n(Browser Download)",
			"rawText": "EQBank.ca -> Download CSV\n(Browser Download)",
			"baseline": 78,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "06zN-X9YeYLjWK9Td6Pza",
			"originalText": "EQBank.ca -> Download CSV\n(Browser Download)"
		},
		{
			"type": "arrow",
			"version": 2085,
			"versionNonce": 174526696,
			"isDeleted": false,
			"id": "6EjzrqlDcY7Sz8kOAhKK9",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -80.2671300860375,
			"y": -278.8777326669544,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 98.53101344785915,
			"height": 75.60606892903655,
			"seed": 1778225821,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582134,
			"link": null,
			"startBinding": {
				"elementId": "06zN-X9YeYLjWK9Td6Pza",
				"gap": 10.910171089851985,
				"focus": 0.08488085208895854
			},
			"endBinding": {
				"elementId": "C8hTvTiHgy9iNXqxGki_Y",
				"gap": 1.6352473893737738,
				"focus": -0.0984320093163041
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-98.53101344785915,
					75.60606892903655
				]
			]
		},
		{
			"type": "rectangle",
			"version": 946,
			"versionNonce": 190599997,
			"isDeleted": false,
			"id": "s-h-WOeLAvGozm4T-fsxK",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -10.600064364346565,
			"y": -201.63641634854406,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 265.4546009410511,
			"height": 31.27272172407669,
			"seed": 830223091,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "ADWnQg0F",
					"type": "text"
				},
				{
					"id": "QdFnqPxhfnZAROwK3G-S9",
					"type": "arrow"
				},
				{
					"id": "6EjzrqlDcY7Sz8kOAhKK9",
					"type": "arrow"
				},
				{
					"id": "lK6Lr_3UmmMQ_NNp-UCaW",
					"type": "arrow"
				},
				{
					"id": "AFZEsWx2cdIWRPlZwdSPe",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 871,
			"versionNonce": 994517144,
			"isDeleted": false,
			"id": "ADWnQg0F",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -5.600064364346565,
			"y": -195.00005548650572,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 255.45460094105113,
			"height": 18,
			"seed": 738155667,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571233,
			"link": null,
			"fontSize": 16.05709881232183,
			"fontFamily": 3,
			"text": "444555666 Details.csv",
			"rawText": "444555666 Details.csv",
			"baseline": 15,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "s-h-WOeLAvGozm4T-fsxK",
			"originalText": "444555666 Details.csv"
		},
		{
			"type": "rectangle",
			"version": 1039,
			"versionNonce": 977855389,
			"isDeleted": false,
			"id": "xRtKLUAg1zTAL-I6TCExU",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 301.39989124644876,
			"y": -201.63641634854406,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 265.4546009410511,
			"height": 31.27272172407669,
			"seed": 77955187,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "QaVDloKh"
				},
				{
					"id": "6EjzrqlDcY7Sz8kOAhKK9",
					"type": "arrow"
				},
				{
					"id": "-rPZ5XkQeT9cgeWJgDJuP",
					"type": "arrow"
				},
				{
					"id": "QdFnqPxhfnZAROwK3G-S9",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 981,
			"versionNonce": 1062779624,
			"isDeleted": false,
			"id": "QaVDloKh",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 306.39989124644876,
			"y": -195.00005548650572,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 255.45460094105113,
			"height": 18,
			"seed": 1440092083,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571234,
			"link": null,
			"fontSize": 16.085724585775292,
			"fontFamily": 3,
			"text": "777888999 Details.csv",
			"rawText": "777888999 Details.csv",
			"baseline": 15,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "xRtKLUAg1zTAL-I6TCExU",
			"originalText": "777888999 Details.csv"
		},
		{
			"type": "arrow",
			"version": 1726,
			"versionNonce": 858184168,
			"isDeleted": false,
			"id": "lK6Lr_3UmmMQ_NNp-UCaW",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 106.27144309874726,
			"y": -281.60609667228937,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 27.3195793603507,
			"height": 75.03893891890169,
			"seed": 1071875027,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582135,
			"link": null,
			"startBinding": {
				"elementId": "06zN-X9YeYLjWK9Td6Pza",
				"gap": 8.181807084517004,
				"focus": -0.07268907780542122
			},
			"endBinding": {
				"elementId": "s-h-WOeLAvGozm4T-fsxK",
				"gap": 4.930741404843616,
				"focus": -0.36601109965678796
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-27.3195793603507,
					75.03893891890169
				]
			]
		},
		{
			"type": "arrow",
			"version": 1672,
			"versionNonce": 1415020520,
			"isDeleted": false,
			"id": "-rPZ5XkQeT9cgeWJgDJuP",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 373.028696849831,
			"y": -288.7879037568064,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 43.9050053091064,
			"height": 83.24241314512312,
			"seed": 203002067,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582135,
			"link": null,
			"startBinding": {
				"elementId": "06zN-X9YeYLjWK9Td6Pza",
				"gap": 1,
				"focus": -0.37588114005832746
			},
			"endBinding": {
				"elementId": "xRtKLUAg1zTAL-I6TCExU",
				"gap": 3.909074263139189,
				"focus": -0.04883531557277693
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					43.9050053091064,
					83.24241314512312
				]
			]
		},
		{
			"type": "ellipse",
			"version": 961,
			"versionNonce": 76570717,
			"isDeleted": false,
			"id": "jfGSLdrr6GJgt4MoFjEjd",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -140.5545487837358,
			"y": -81.636416348544,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 521,
			"height": 75,
			"seed": 652285405,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "FH3z7uPJ"
				},
				{
					"id": "AFZEsWx2cdIWRPlZwdSPe",
					"type": "arrow"
				},
				{
					"id": "QdFnqPxhfnZAROwK3G-S9",
					"type": "arrow"
				},
				{
					"id": "jJm0huuw1jwx9-Zt-p0mK",
					"type": "arrow"
				},
				{
					"id": "5Y8XtocoOibdVhs3NkEnV",
					"type": "arrow"
				},
				{
					"id": "kkHfdwuziY_7MDCEY-cDW",
					"type": "arrow"
				},
				{
					"id": "moiLeDjimYqoHiJE4eb8n",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 1642,
			"versionNonce": 325722099,
			"isDeleted": false,
			"id": "FH3z7uPJ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -135.5545487837358,
			"y": -61.136416348544,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 511,
			"height": 34,
			"seed": 1997562131,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "jJm0huuw1jwx9-Zt-p0mK",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null,
			"fontSize": 28,
			"fontFamily": 3,
			"text": "./data/2022-05-24/eqbank",
			"rawText": "./data/2022-05-24/eqbank",
			"baseline": 27,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "jfGSLdrr6GJgt4MoFjEjd",
			"originalText": "./data/2022-05-24/eqbank"
		},
		{
			"type": "arrow",
			"version": 3075,
			"versionNonce": 1058646248,
			"isDeleted": false,
			"id": "QdFnqPxhfnZAROwK3G-S9",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 373.53954367557543,
			"y": -164.4499527572038,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 116.2971463598696,
			"height": 86.26358079931431,
			"seed": 919096659,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582136,
			"link": null,
			"startBinding": {
				"elementId": "xRtKLUAg1zTAL-I6TCExU",
				"gap": 5.913741867263582,
				"focus": 0.20502658789354822
			},
			"endBinding": {
				"elementId": "jfGSLdrr6GJgt4MoFjEjd",
				"gap": 2.4258473613159452,
				"focus": 0.3444075716580133
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-116.2971463598696,
					86.26358079931431
				]
			]
		},
		{
			"type": "arrow",
			"version": 2428,
			"versionNonce": 840345064,
			"isDeleted": false,
			"id": "AFZEsWx2cdIWRPlZwdSPe",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 84.34505703816079,
			"y": -166.14388574965741,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 7.200357717153182,
			"height": 82.25900659974425,
			"seed": 53603507,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582136,
			"link": null,
			"startBinding": {
				"elementId": "s-h-WOeLAvGozm4T-fsxK",
				"gap": 4.2198088748099565,
				"focus": 0.29471606952751705
			},
			"endBinding": {
				"elementId": "jfGSLdrr6GJgt4MoFjEjd",
				"gap": 2.482289581471072,
				"focus": -0.09565744989613535
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					7.200357717153182,
					82.25900659974425
				]
			]
		},
		{
			"type": "rectangle",
			"version": 210,
			"versionNonce": 1529851165,
			"isDeleted": false,
			"id": "FwabTqYxomBwA-m2SASkm",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -335.6908957741477,
			"y": -210.3636668812145,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 922.909102006392,
			"height": 54.54545454545456,
			"seed": 528692125,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "rectangle",
			"version": 1210,
			"versionNonce": 1925381939,
			"isDeleted": false,
			"id": "YN2f-fbOQLsO1dNz8MVae",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -600.2482965642755,
			"y": 140,
			"strokeColor": "#000000",
			"backgroundColor": "#40c057",
			"width": 1361,
			"height": 56,
			"seed": 819372019,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "Ww9ycXTh",
					"type": "text"
				},
				{
					"id": "5Y8XtocoOibdVhs3NkEnV",
					"type": "arrow"
				},
				{
					"id": "kkHfdwuziY_7MDCEY-cDW",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 1005,
			"versionNonce": 1314259325,
			"isDeleted": false,
			"id": "Ww9ycXTh",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -595.2482965642755,
			"y": 145,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 1351,
			"height": 46,
			"seed": 1700383933,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208979,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "Excel",
			"rawText": "Excel",
			"baseline": 32,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "YN2f-fbOQLsO1dNz8MVae",
			"originalText": "Excel"
		},
		{
			"type": "arrow",
			"version": 847,
			"versionNonce": 1556753816,
			"isDeleted": false,
			"id": "5Y8XtocoOibdVhs3NkEnV",
			"fillStyle": "hachure",
			"strokeWidth": 4,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 90.10098048433164,
			"y": 139,
			"strokeColor": "#000000",
			"backgroundColor": "#40c057",
			"width": 8.05692796925024,
			"height": 140.09119266654687,
			"seed": 864655187,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582137,
			"link": null,
			"startBinding": {
				"elementId": "YN2f-fbOQLsO1dNz8MVae",
				"gap": 1,
				"focus": 0.011994288792420715
			},
			"endBinding": {
				"elementId": "jfGSLdrr6GJgt4MoFjEjd",
				"gap": 5.69013970151876,
				"focus": 0.07413152794166888
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					8.05692796925024,
					-140.09119266654687
				]
			]
		},
		{
			"type": "rectangle",
			"version": 877,
			"versionNonce": 1181927901,
			"isDeleted": false,
			"id": "1ebyj1NXRInZtIM26oJrY",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -640,
			"y": 560,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 273,
			"height": 73,
			"seed": 740437523,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "KJVlSkoB"
				},
				{
					"id": "moiLeDjimYqoHiJE4eb8n",
					"type": "arrow"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 875,
			"versionNonce": 404693912,
			"isDeleted": false,
			"id": "KJVlSkoB",
			"fillStyle": "hachure",
			"strokeWidth": 4,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -635,
			"y": 578,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 263,
			"height": 37,
			"seed": 1924120381,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571238,
			"link": null,
			"fontSize": 16,
			"fontFamily": 3,
			"text": "PQ File Query\nPattern = `* Details.csv`",
			"rawText": "PQ File Query\nPattern = `* Details.csv`",
			"baseline": 33,
			"textAlign": "right",
			"verticalAlign": "middle",
			"containerId": "1ebyj1NXRInZtIM26oJrY",
			"originalText": "PQ File Query\nPattern = `* Details.csv`"
		},
		{
			"type": "arrow",
			"version": 392,
			"versionNonce": 1935719064,
			"isDeleted": false,
			"id": "kkHfdwuziY_7MDCEY-cDW",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 98.39453144340656,
			"y": -0.03993109817020013,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 4.32090489506426,
			"height": 138.02259210499562,
			"seed": 1615436691,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582138,
			"link": null,
			"startBinding": {
				"elementId": "jfGSLdrr6GJgt4MoFjEjd",
				"gap": 6.740572442906128,
				"focus": 0.0774289446766814
			},
			"endBinding": {
				"elementId": "YN2f-fbOQLsO1dNz8MVae",
				"gap": 2.017338993174576,
				"focus": 0.018906149147520996
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-4.32090489506426,
					138.02259210499562
				]
			]
		},
		{
			"type": "rectangle",
			"version": 1304,
			"versionNonce": 389597203,
			"isDeleted": false,
			"id": "T6bwKXU3A7gj4qYbSpvcD",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -980,
			"y": 380,
			"strokeColor": "#000000",
			"backgroundColor": "#12b886",
			"width": 899,
			"height": 56,
			"seed": 2008083261,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "5EY3g8Ns"
				},
				{
					"id": "5Y8XtocoOibdVhs3NkEnV",
					"type": "arrow"
				},
				{
					"id": "kkHfdwuziY_7MDCEY-cDW",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 1118,
			"versionNonce": 732280477,
			"isDeleted": false,
			"id": "5EY3g8Ns",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -975,
			"y": 385,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 889,
			"height": 46,
			"seed": 1050989981,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208979,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "Power Query (PQ) in Excel",
			"rawText": "Power Query (PQ) in Excel",
			"baseline": 32,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "T6bwKXU3A7gj4qYbSpvcD",
			"originalText": "Power Query (PQ) in Excel"
		},
		{
			"type": "arrow",
			"version": 388,
			"versionNonce": 2081413864,
			"isDeleted": false,
			"id": "moiLeDjimYqoHiJE4eb8n",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -641,
			"y": 572.867279109717,
			"strokeColor": "#000000",
			"backgroundColor": "#12b886",
			"width": 579.9660004504211,
			"height": 612.8578999236263,
			"seed": 78942771,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582138,
			"link": null,
			"startBinding": {
				"elementId": "1ebyj1NXRInZtIM26oJrY",
				"gap": 1,
				"focus": -0.0958904109589041
			},
			"endBinding": {
				"elementId": "jfGSLdrr6GJgt4MoFjEjd",
				"gap": 1,
				"focus": 0.8336331343302672
			},
			"lastCommittedPoint": null,
			"startArrowhead": "dot",
			"endArrowhead": "dot",
			"points": [
				[
					0,
					0
				],
				[
					-59,
					-12.867279109716947
				],
				[
					-79,
					-452.86727910971695
				],
				[
					500.9660004504211,
					-612.8578999236263
				]
			]
		},
		{
			"type": "line",
			"version": 153,
			"versionNonce": 1928713907,
			"isDeleted": false,
			"id": "fE1EwtqUa61kDyqG7qgEs",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1440,
			"y": 80.82640388272702,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 2759.0599247250702,
			"height": 0.8264038827270213,
			"seed": 1090413053,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653458346059,
			"link": null,
			"startBinding": null,
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"points": [
				[
					0,
					0
				],
				[
					2759.0599247250702,
					0.8264038827270213
				]
			]
		},
		{
			"type": "image",
			"version": 411,
			"versionNonce": 1860050771,
			"isDeleted": false,
			"id": "00Qz-TYPAemuI8MDl0SQc",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1160,
			"y": -240,
			"strokeColor": "transparent",
			"backgroundColor": "#fd7e14",
			"width": 606.1057529610829,
			"height": 262.0398683247988,
			"seed": 711870515,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653458208979,
			"link": null,
			"status": "pending",
			"fileId": "a82c8209f4aa63cf9102d3f4dc6d5eb619634c3b",
			"scale": [
				1,
				1
			]
		},
		{
			"type": "arrow",
			"version": 2120,
			"versionNonce": 1900153320,
			"isDeleted": false,
			"id": "RDoj4kCL3e-IyLMI94yg6",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -619.7492167796938,
			"y": 640.9797657193616,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 99.75103930395073,
			"height": 96.58583464839808,
			"seed": 1235264755,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582140,
			"link": null,
			"startBinding": {
				"elementId": "1ebyj1NXRInZtIM26oJrY",
				"gap": 7.9797657193615805,
				"focus": 0.9310575219823759
			},
			"endBinding": {
				"elementId": "SK5dNaCIjX9NcvJ2BUhMo",
				"gap": 2.4343996322403427,
				"focus": -0.1612357897179182
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					99.75103930395073,
					96.58583464839808
				]
			]
		},
		{
			"type": "arrow",
			"version": 2125,
			"versionNonce": 1261997288,
			"isDeleted": false,
			"id": "y3SmxuaWomM5ItSpBYxIp",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -539.7492167796939,
			"y": 640.9797657193616,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 99.75103930395085,
			"height": 96.58583464839808,
			"seed": 565980435,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582140,
			"link": null,
			"startBinding": {
				"elementId": "1ebyj1NXRInZtIM26oJrY",
				"gap": 7.9797657193615805,
				"focus": 0.47180508963752604
			},
			"endBinding": {
				"elementId": "SK5dNaCIjX9NcvJ2BUhMo",
				"gap": 2.4343996322403427,
				"focus": 0.07248144943884319
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					99.75103930395085,
					96.58583464839808
				]
			]
		},
		{
			"type": "arrow",
			"version": 2130,
			"versionNonce": 1231466472,
			"isDeleted": false,
			"id": "_4484EY65uSrA--Jtfmt0",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -459.74921677969394,
			"y": 640.9797657193616,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 99.75103930395079,
			"height": 96.58583464839808,
			"seed": 587112755,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582140,
			"link": null,
			"startBinding": {
				"elementId": "1ebyj1NXRInZtIM26oJrY",
				"gap": 7.9797657193615805,
				"focus": 0.012552657292676062
			},
			"endBinding": {
				"elementId": "SK5dNaCIjX9NcvJ2BUhMo",
				"gap": 2.4343996322403427,
				"focus": 0.3061986885956043
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					99.75103930395079,
					96.58583464839808
				]
			]
		},
		{
			"type": "arrow",
			"version": 2134,
			"versionNonce": 1138258664,
			"isDeleted": false,
			"id": "EWRPnwVNXI2AHo_SY7hgk",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -379.74921677969394,
			"y": 640.9797657193616,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 99.75103930395085,
			"height": 96.58583464839808,
			"seed": 54629363,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582140,
			"link": null,
			"startBinding": {
				"elementId": "1ebyj1NXRInZtIM26oJrY",
				"gap": 7.9797657193615805,
				"focus": -0.4466997750521737
			},
			"endBinding": {
				"elementId": "SK5dNaCIjX9NcvJ2BUhMo",
				"gap": 2.4343996322403427,
				"focus": 0.5399159277523654
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					99.75103930395085,
					96.58583464839808
				]
			]
		},
		{
			"type": "rectangle",
			"version": 54,
			"versionNonce": 1242234909,
			"isDeleted": false,
			"id": "SK5dNaCIjX9NcvJ2BUhMo",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -660,
			"y": 740,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 540,
			"height": 140,
			"seed": 462717267,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "jCgyPSY6"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 56,
			"versionNonce": 1882872883,
			"isDeleted": false,
			"id": "jCgyPSY6",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -655,
			"y": 787,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 530,
			"height": 46,
			"seed": 1288001661,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208979,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "`Combine Files` Process",
			"rawText": "`Combine Files` Process",
			"baseline": 32,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "SK5dNaCIjX9NcvJ2BUhMo",
			"originalText": "`Combine Files` Process"
		},
		{
			"type": "rectangle",
			"version": 372,
			"versionNonce": 206500989,
			"isDeleted": false,
			"id": "x6y4FxKQx1IVp0JwzFKsx",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -700,
			"y": 1120,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#15aabf",
			"width": 660,
			"height": 140,
			"seed": 46269587,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "EL3Gt4vA"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "oEcslAaFMe-v6ozB6eckI",
					"type": "arrow"
				}
			],
			"updated": 1653458208979,
			"link": null
		},
		{
			"type": "text",
			"version": 426,
			"versionNonce": 1769027304,
			"isDeleted": false,
			"id": "EL3Gt4vA",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -695,
			"y": 1125,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#228be6",
			"width": 650,
			"height": 85,
			"seed": 32867485,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571241,
			"link": null,
			"fontSize": 36,
			"fontFamily": 3,
			"text": "ImportSourceRows\n(w/ Source Cols)",
			"rawText": "ImportSourceRows\n(w/ Source Cols)",
			"baseline": 76,
			"textAlign": "center",
			"verticalAlign": "top",
			"containerId": "x6y4FxKQx1IVp0JwzFKsx",
			"originalText": "ImportSourceRows\n(w/ Source Cols)"
		},
		{
			"type": "arrow",
			"version": 3671,
			"versionNonce": 1446435048,
			"isDeleted": false,
			"id": "10rfbBw_Lzkjf5kT_CIN6",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -352.9697480064076,
			"y": 881.6463100909448,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 116.9825925333505,
			"height": 210.35368990905522,
			"seed": 1553961949,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582141,
			"link": null,
			"startBinding": {
				"elementId": "SK5dNaCIjX9NcvJ2BUhMo",
				"gap": 1.646310090944814,
				"focus": -0.2488420554048511
			},
			"endBinding": {
				"elementId": "x6y4FxKQx1IVp0JwzFKsx",
				"gap": 28,
				"focus": -0.41865123055488723
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-116.9825925333505,
					210.35368990905522
				]
			]
		},
		{
			"type": "rectangle",
			"version": 810,
			"versionNonce": 694233971,
			"isDeleted": false,
			"id": "-qtUng8hg1MkfE4hitN20",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -360,
			"y": 2240,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#15aabf",
			"width": 1020,
			"height": 400,
			"seed": 269889043,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "-MzqKv-6PB10pChkqfp8o",
					"type": "arrow"
				},
				{
					"type": "text",
					"id": "yBwu7RVu"
				},
				{
					"id": "84LQyjwcO8EY7BdnH8fTO",
					"type": "arrow"
				}
			],
			"updated": 1653458208980,
			"link": null
		},
		{
			"type": "text",
			"version": 600,
			"versionNonce": 839124376,
			"isDeleted": false,
			"id": "yBwu7RVu",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -355,
			"y": 2419,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#228be6",
			"width": 1010,
			"height": 42,
			"seed": 1178185885,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571242,
			"link": null,
			"fontSize": 36,
			"fontFamily": 3,
			"text": "TransactionsAfterImportDistinct",
			"rawText": "TransactionsAfterImportDistinct",
			"baseline": 34,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "-qtUng8hg1MkfE4hitN20",
			"originalText": "TransactionsAfterImportDistinct"
		},
		{
			"type": "rectangle",
			"version": 814,
			"versionNonce": 1036385501,
			"isDeleted": false,
			"id": "USabfwjla1G6hGBotSddj",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1920,
			"y": 2180,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#e64980",
			"width": 1060,
			"height": 147,
			"seed": 2103360915,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "KXXVzche",
					"type": "text"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "_zHmmb_uUhlR7eqIu40FZ",
					"type": "arrow"
				},
				{
					"id": "yV8wvF-pY2jp24qRxQTPn",
					"type": "arrow"
				}
			],
			"updated": 1653458452584,
			"link": null
		},
		{
			"type": "text",
			"version": 940,
			"versionNonce": 1732938611,
			"isDeleted": false,
			"id": "KXXVzche",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1925,
			"y": 2203,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#228be6",
			"width": 1050,
			"height": 101,
			"seed": 455334173,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458452584,
			"link": null,
			"fontSize": 28,
			"fontFamily": 3,
			"text": "// CreateSlugIfNull\n\ncreateSlug(date, amount, description)",
			"rawText": "// CreateSlugIfNull\n\ncreateSlug(date, amount, description)",
			"baseline": 95,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "USabfwjla1G6hGBotSddj",
			"originalText": "// CreateSlugIfNull\n\ncreateSlug(date, amount, description)"
		},
		{
			"type": "rectangle",
			"version": 468,
			"versionNonce": 806169267,
			"isDeleted": false,
			"id": "MzPLXSNmaYI3x5j7IS6Gf",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 240,
			"y": 1120,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#15aabf",
			"width": 800,
			"height": 137,
			"seed": 377595837,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "CvVM8OZd",
					"type": "text"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "JfnwkVZoqcGXhuUxfrdVb",
					"type": "arrow"
				},
				{
					"id": "dXpWBN-nZX6YA5nCaWcMs",
					"type": "arrow"
				}
			],
			"updated": 1653458208980,
			"link": null
		},
		{
			"type": "text",
			"version": 520,
			"versionNonce": 1290303896,
			"isDeleted": false,
			"id": "CvVM8OZd",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 245,
			"y": 1125,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#228be6",
			"width": 790,
			"height": 127,
			"seed": 1234927251,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571244,
			"link": null,
			"fontSize": 36,
			"fontFamily": 3,
			"text": "Transactions\n(existing, standard cols, dynamic \ncols)",
			"rawText": "Transactions\n(existing, standard cols, dynamic cols)",
			"baseline": 119,
			"textAlign": "center",
			"verticalAlign": "top",
			"containerId": "MzPLXSNmaYI3x5j7IS6Gf",
			"originalText": "Transactions\n(existing, standard cols, dynamic cols)"
		},
		{
			"type": "rectangle",
			"version": 520,
			"versionNonce": 195348979,
			"isDeleted": false,
			"id": "pLzgoDWL8Q7SrIH2_MXUB",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 2100,
			"y": 1540,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 740,
			"height": 346,
			"seed": 1190207443,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "HWVsIxsU",
					"type": "text"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "dXpWBN-nZX6YA5nCaWcMs",
					"type": "arrow"
				},
				{
					"id": "_zHmmb_uUhlR7eqIu40FZ",
					"type": "arrow"
				},
				{
					"id": "E3_KOPE6IZ1SBbe6qTyAn",
					"type": "arrow"
				},
				{
					"id": "oE6NdAqEZy5129oxXQJKK",
					"type": "arrow"
				}
			],
			"updated": 1653458466159,
			"link": null
		},
		{
			"type": "text",
			"version": 648,
			"versionNonce": 47527144,
			"isDeleted": false,
			"id": "HWVsIxsU",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 2105,
			"y": 1592.5,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 730,
			"height": 241,
			"seed": 873446109,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571245,
			"link": null,
			"fontSize": 28,
			"fontFamily": 1,
			"text": "Table.Combine(\n    Transactions,\n    ImportSourceNormalized)\n\nAdd Column(\"IsFromImport\", each (1 or 0), type \nbinary)\n    ",
			"rawText": "Table.Combine(\n    Transactions,\n    ImportSourceNormalized)\n\nAdd Column(\"IsFromImport\", each (1 or 0), type binary)\n    ",
			"baseline": 231,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "pLzgoDWL8Q7SrIH2_MXUB",
			"originalText": "Table.Combine(\n    Transactions,\n    ImportSourceNormalized)\n\nAdd Column(\"IsFromImport\", each (1 or 0), type binary)\n    "
		},
		{
			"type": "rectangle",
			"version": 895,
			"versionNonce": 833971187,
			"isDeleted": false,
			"id": "-agTPa_xRCW7PE6gAr6Zo",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 3400,
			"y": 1280,
			"strokeColor": "#000000",
			"backgroundColor": "#ced4da",
			"width": 1340,
			"height": 760,
			"seed": 699658525,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "0fTV65Xm",
					"type": "text"
				},
				{
					"id": "E3_KOPE6IZ1SBbe6qTyAn",
					"type": "arrow"
				}
			],
			"updated": 1653458458642,
			"link": null
		},
		{
			"type": "text",
			"version": 851,
			"versionNonce": 1534163608,
			"isDeleted": false,
			"id": "0fTV65Xm",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 3405,
			"y": 1285,
			"strokeColor": "#000000",
			"backgroundColor": "#ced4da",
			"width": 1330,
			"height": 478,
			"seed": 1888811827,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571251,
			"link": null,
			"fontSize": 16,
			"fontFamily": 3,
			"text": "let\n    Source = Table.Combine({\n        Table.AddColumn(Transactions, \"IsFromImport\", each 0, type binary),\n        Table.AddColumn(ImportSourceNormalized, \"IsFromImport\", each 1, type binary)\n    }),\n    #\"Changed Type\" = Table.TransformColumnTypes(Source,{{\"Amount\", Currency.Type}}),\n    #\"Replaced Value\" = Table.ReplaceValue(#\"Changed Type\",\"\",\n        // \"createSlug(\n        //     [Date],\n        //     _[Amount],\n        //     _[Description]\n        // )\",\n        \"asdf\",\n        Replacer.ReplaceValue, {\"slug\"}\n    ),\n    #\"Renamed Columns\" = Table.RenameColumns(#\"Replaced Value\",{{\"slug\", \"originalSlug\"}}),\n    CreateSlugIfNull = Table.AddColumn(#\"Renamed Columns\", \"slug\", each if ([originalSlug] = null) then createSlug([Date], [Amount], \n[Description]) else [originalSlug]),\n    #\"Removed Columns\" = Table.RemoveColumns(CreateSlugIfNull,{\"originalSlug\"}),\n    #\"Reordered Columns\" = Table.ReorderColumns(#\"Removed Columns\",{\"slug\", \"Date\", \"Description\", \"Category\", \"Amount\", \"Account\", \"Account \n#\", \"Institution\", \"Month\", \"Week\", \"Check Number\", \"Full Description\", \"Transaction ID\", \"Account ID\", \"Date Added\", \"IsFromImport\", \n\"Balance\"}),\n    // #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"Description\", \"Date\", \"Amount\"}),\n    #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})\nin\n    #\"Removed Duplicates\"",
			"rawText": "let\n    Source = Table.Combine({\n        Table.AddColumn(Transactions, \"IsFromImport\", each 0, type binary),\n        Table.AddColumn(ImportSourceNormalized, \"IsFromImport\", each 1, type binary)\n    }),\n    #\"Changed Type\" = Table.TransformColumnTypes(Source,{{\"Amount\", Currency.Type}}),\n    #\"Replaced Value\" = Table.ReplaceValue(#\"Changed Type\",\"\",\n        // \"createSlug(\n        //     [Date],\n        //     _[Amount],\n        //     _[Description]\n        // )\",\n        \"asdf\",\n        Replacer.ReplaceValue, {\"slug\"}\n    ),\n    #\"Renamed Columns\" = Table.RenameColumns(#\"Replaced Value\",{{\"slug\", \"originalSlug\"}}),\n    CreateSlugIfNull = Table.AddColumn(#\"Renamed Columns\", \"slug\", each if ([originalSlug] = null) then createSlug([Date], [Amount], [Description]) else [originalSlug]),\n    #\"Removed Columns\" = Table.RemoveColumns(CreateSlugIfNull,{\"originalSlug\"}),\n    #\"Reordered Columns\" = Table.ReorderColumns(#\"Removed Columns\",{\"slug\", \"Date\", \"Description\", \"Category\", \"Amount\", \"Account\", \"Account #\", \"Institution\", \"Month\", \"Week\", \"Check Number\", \"Full Description\", \"Transaction ID\", \"Account ID\", \"Date Added\", \"IsFromImport\", \"Balance\"}),\n    // #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"Description\", \"Date\", \"Amount\"}),\n    #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})\nin\n    #\"Removed Duplicates\"",
			"baseline": 475,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": "-agTPa_xRCW7PE6gAr6Zo",
			"originalText": "let\n    Source = Table.Combine({\n        Table.AddColumn(Transactions, \"IsFromImport\", each 0, type binary),\n        Table.AddColumn(ImportSourceNormalized, \"IsFromImport\", each 1, type binary)\n    }),\n    #\"Changed Type\" = Table.TransformColumnTypes(Source,{{\"Amount\", Currency.Type}}),\n    #\"Replaced Value\" = Table.ReplaceValue(#\"Changed Type\",\"\",\n        // \"createSlug(\n        //     [Date],\n        //     _[Amount],\n        //     _[Description]\n        // )\",\n        \"asdf\",\n        Replacer.ReplaceValue, {\"slug\"}\n    ),\n    #\"Renamed Columns\" = Table.RenameColumns(#\"Replaced Value\",{{\"slug\", \"originalSlug\"}}),\n    CreateSlugIfNull = Table.AddColumn(#\"Renamed Columns\", \"slug\", each if ([originalSlug] = null) then createSlug([Date], [Amount], [Description]) else [originalSlug]),\n    #\"Removed Columns\" = Table.RemoveColumns(CreateSlugIfNull,{\"originalSlug\"}),\n    #\"Reordered Columns\" = Table.ReorderColumns(#\"Removed Columns\",{\"slug\", \"Date\", \"Description\", \"Category\", \"Amount\", \"Account\", \"Account #\", \"Institution\", \"Month\", \"Week\", \"Check Number\", \"Full Description\", \"Transaction ID\", \"Account ID\", \"Date Added\", \"IsFromImport\", \"Balance\"}),\n    // #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"Description\", \"Date\", \"Amount\"}),\n    #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})\nin\n    #\"Removed Duplicates\""
		},
		{
			"type": "arrow",
			"version": 4205,
			"versionNonce": 1055698072,
			"isDeleted": false,
			"id": "oEcslAaFMe-v6ozB6eckI",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -279.96981850640304,
			"y": 1286.7477203647418,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 4.230115989942988,
			"height": 291.3799392097262,
			"seed": 195270365,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582155,
			"link": null,
			"startBinding": {
				"elementId": "x6y4FxKQx1IVp0JwzFKsx",
				"gap": 26.747720364741646,
				"focus": -0.27622428047340913
			},
			"endBinding": {
				"elementId": "V1N4pQLTBnsqPPFQnGGnc",
				"gap": 1.8723404255320368,
				"focus": -0.735435484643253
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-4.230115989942988,
					291.3799392097262
				]
			]
		},
		{
			"type": "arrow",
			"version": 5049,
			"versionNonce": 182147480,
			"isDeleted": false,
			"id": "oE6NdAqEZy5129oxXQJKK",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 621.76855987655,
			"y": 1604.1338570465205,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 1477.23144012345,
			"height": 4.131060558139325,
			"seed": 972282813,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582155,
			"link": null,
			"startBinding": {
				"elementId": "V1N4pQLTBnsqPPFQnGGnc",
				"gap": 21.768559876549944,
				"focus": -0.8778502742162404
			},
			"endBinding": {
				"elementId": "pLzgoDWL8Q7SrIH2_MXUB",
				"gap": 1,
				"focus": 0.6552411688108586
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					1477.23144012345,
					-4.131060558139325
				]
			]
		},
		{
			"type": "arrow",
			"version": 2586,
			"versionNonce": 1022149784,
			"isDeleted": false,
			"id": "_zHmmb_uUhlR7eqIu40FZ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 2445.11546606838,
			"y": 1896.394849785408,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 26.56337864715306,
			"height": 268.7553648068665,
			"seed": 1712154931,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582145,
			"link": null,
			"startBinding": {
				"elementId": "pLzgoDWL8Q7SrIH2_MXUB",
				"gap": 10.394849785407725,
				"focus": 0.1111111111111111
			},
			"endBinding": {
				"elementId": "USabfwjla1G6hGBotSddj",
				"gap": 14.84978540772532,
				"focus": 0.05660377358490566
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					26.56337864715306,
					268.7553648068665
				]
			]
		},
		{
			"type": "arrow",
			"version": 3008,
			"versionNonce": 677832088,
			"isDeleted": false,
			"id": "yV8wvF-pY2jp24qRxQTPn",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 2447.370468091471,
			"y": 2339.366608121619,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 49.534962712540164,
			"height": 119.63339187838119,
			"seed": 977102461,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582154,
			"link": null,
			"startBinding": {
				"elementId": "USabfwjla1G6hGBotSddj",
				"gap": 12.36660812161881,
				"focus": -0.058747520880457545
			},
			"endBinding": {
				"elementId": "UUdSMLnCw1yCo1P-pp4BF",
				"gap": 1,
				"focus": -0.01672417723275001
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-49.534962712540164,
					119.63339187838119
				]
			]
		},
		{
			"type": "rectangle",
			"version": 823,
			"versionNonce": 1859984083,
			"isDeleted": false,
			"id": "ghzgxrSKo15ZdF88393wJ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 3040,
			"y": 2420,
			"strokeColor": "#495057",
			"backgroundColor": "#ced4da",
			"width": 1200,
			"height": 140,
			"seed": 185060339,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "S6ht7Lot",
					"type": "text"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "dXpWBN-nZX6YA5nCaWcMs",
					"type": "arrow"
				},
				{
					"id": "_zHmmb_uUhlR7eqIu40FZ",
					"type": "arrow"
				},
				{
					"id": "MYRVouLCejR9u3dVo9Ync",
					"type": "arrow"
				}
			],
			"updated": 1653458208980,
			"link": null
		},
		{
			"type": "text",
			"version": 959,
			"versionNonce": 1295314909,
			"isDeleted": false,
			"id": "S6ht7Lot",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 3045,
			"y": 2473,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 1190,
			"height": 34,
			"seed": 1663131837,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208980,
			"link": null,
			"fontSize": 28,
			"fontFamily": 3,
			"text": "#\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})",
			"rawText": "#\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})",
			"baseline": 27,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "ghzgxrSKo15ZdF88393wJ",
			"originalText": "#\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})"
		},
		{
			"type": "rectangle",
			"version": 890,
			"versionNonce": 12077171,
			"isDeleted": false,
			"id": "M4NU2uI4AKzVR6MfQnG0V",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 4560.245977853983,
			"y": 2344.147409857642,
			"strokeColor": "#495057",
			"backgroundColor": "#ced4da",
			"width": 540,
			"height": 196,
			"seed": 1769818003,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "RhFnHoR2",
					"type": "text"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "dXpWBN-nZX6YA5nCaWcMs",
					"type": "arrow"
				},
				{
					"id": "_zHmmb_uUhlR7eqIu40FZ",
					"type": "arrow"
				},
				{
					"id": "MYRVouLCejR9u3dVo9Ync",
					"type": "arrow"
				}
			],
			"updated": 1653458208980,
			"link": null
		},
		{
			"type": "text",
			"version": 1032,
			"versionNonce": 1058504168,
			"isDeleted": false,
			"id": "RhFnHoR2",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 4565.245977853983,
			"y": 2405.147409857642,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 530,
			"height": 74,
			"seed": 1837821725,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571253,
			"link": null,
			"fontSize": 16,
			"fontFamily": 3,
			"text": "// #\"Removed Duplicates\" = Table.Distinct(#\"Reordered \nColumns\", {\"Description\", \"Date\", \"Amount\"}),\n    #\"Removed Duplicates\" = Table.Distinct(#\"Reordered \nColumns\", {\"slug\"})",
			"rawText": "// #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"Description\", \"Date\", \"Amount\"}),\n    #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})",
			"baseline": 70,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "M4NU2uI4AKzVR6MfQnG0V",
			"originalText": "// #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"Description\", \"Date\", \"Amount\"}),\n    #\"Removed Duplicates\" = Table.Distinct(#\"Reordered Columns\", {\"slug\"})"
		},
		{
			"type": "text",
			"version": 727,
			"versionNonce": 907854355,
			"isDeleted": false,
			"id": "wePfiiDx",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 6.067533972154309,
			"x": 4478.618551752466,
			"y": 2296.206271307613,
			"strokeColor": "#000000",
			"backgroundColor": "#ced4da",
			"width": 341,
			"height": 24,
			"seed": 269916531,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208980,
			"link": null,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "Alternate w/o slug (ewww?)...",
			"rawText": "Alternate w/o slug (ewww?)...",
			"baseline": 19,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Alternate w/o slug (ewww?)..."
		},
		{
			"type": "rectangle",
			"version": 855,
			"versionNonce": 624722077,
			"isDeleted": false,
			"id": "UUdSMLnCw1yCo1P-pp4BF",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1860,
			"y": 2460,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#e64980",
			"width": 1060,
			"height": 80,
			"seed": 2126135251,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "VQ03NPPh",
					"type": "text"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "yV8wvF-pY2jp24qRxQTPn",
					"type": "arrow"
				},
				{
					"id": "MYRVouLCejR9u3dVo9Ync",
					"type": "arrow"
				},
				{
					"id": "-MzqKv-6PB10pChkqfp8o",
					"type": "arrow"
				}
			],
			"updated": 1653458436359,
			"link": null
		},
		{
			"type": "text",
			"version": 959,
			"versionNonce": 1329191832,
			"isDeleted": false,
			"id": "VQ03NPPh",
			"fillStyle": "cross-hatch",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1865,
			"y": 2479,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#228be6",
			"width": 1050,
			"height": 42,
			"seed": 283679453,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571254,
			"link": null,
			"fontSize": 36,
			"fontFamily": 3,
			"text": "Table.Distinct by slug",
			"rawText": "Table.Distinct by slug",
			"baseline": 34,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "UUdSMLnCw1yCo1P-pp4BF",
			"originalText": "Table.Distinct by slug"
		},
		{
			"type": "arrow",
			"version": 3883,
			"versionNonce": 447115928,
			"isDeleted": false,
			"id": "MYRVouLCejR9u3dVo9Ync",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 2939.366608121619,
			"y": 2502.2817960548186,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 80.63339187838119,
			"height": 0.5112898341435539,
			"seed": 878051795,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582154,
			"link": null,
			"startBinding": {
				"elementId": "UUdSMLnCw1yCo1P-pp4BF",
				"gap": 19.36660812161881,
				"focus": 0.018741416506533992
			},
			"endBinding": {
				"elementId": "ghzgxrSKo15ZdF88393wJ",
				"gap": 20,
				"focus": -0.1062148073307758
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"points": [
				[
					0,
					0
				],
				[
					80.63339187838119,
					-0.5112898341435539
				]
			]
		},
		{
			"type": "arrow",
			"version": 62,
			"versionNonce": 692882072,
			"isDeleted": false,
			"id": "JfnwkVZoqcGXhuUxfrdVb",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 560.0672730956227,
			"y": 180.1395988013595,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 0,
			"height": 920.0000000000001,
			"seed": 1227066259,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582144,
			"link": null,
			"startBinding": null,
			"endBinding": {
				"elementId": "MzPLXSNmaYI3x5j7IS6Gf",
				"gap": 19.860401198640375,
				"focus": -0.1998318172609433
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					0,
					920.0000000000001
				]
			]
		},
		{
			"type": "rectangle",
			"version": 452,
			"versionNonce": 1143246013,
			"isDeleted": false,
			"id": "V1N4pQLTBnsqPPFQnGGnc",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -420,
			"y": 1580,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 1020,
			"height": 440,
			"seed": 2005464477,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "nYFmlPhg",
					"type": "text"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "oEcslAaFMe-v6ozB6eckI",
					"type": "arrow"
				},
				{
					"id": "oE6NdAqEZy5129oxXQJKK",
					"type": "arrow"
				},
				{
					"id": "_zHmmb_uUhlR7eqIu40FZ",
					"type": "arrow"
				},
				{
					"id": "dXpWBN-nZX6YA5nCaWcMs",
					"type": "arrow"
				},
				{
					"id": "84LQyjwcO8EY7BdnH8fTO",
					"type": "arrow"
				},
				{
					"id": "-MzqKv-6PB10pChkqfp8o",
					"type": "arrow"
				}
			],
			"updated": 1653458427004,
			"link": null
		},
		{
			"type": "text",
			"version": 855,
			"versionNonce": 449648104,
			"isDeleted": false,
			"id": "nYFmlPhg",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -415,
			"y": 1640.5,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 1010,
			"height": 319,
			"seed": 1507884723,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571255,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "Magic\n\n- Combine `Transactions` and `ImportedTransactions`\n- Generate `slug` from Date, Amount, Description (if \nnot already set)\n- Run `Table.Distinct(...)` on `slug`\n- ",
			"rawText": "Magic\n\n- Combine `Transactions` and `ImportedTransactions`\n- Generate `slug` from Date, Amount, Description (if not already set)\n- Run `Table.Distinct(...)` on `slug`\n- ",
			"baseline": 306,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "V1N4pQLTBnsqPPFQnGGnc",
			"originalText": "Magic\n\n- Combine `Transactions` and `ImportedTransactions`\n- Generate `slug` from Date, Amount, Description (if not already set)\n- Run `Table.Distinct(...)` on `slug`\n- "
		},
		{
			"type": "arrow",
			"version": 4189,
			"versionNonce": 510420632,
			"isDeleted": false,
			"id": "dXpWBN-nZX6YA5nCaWcMs",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 459.97757643391014,
			"y": 1283.7477203647418,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 1.5717855113028918,
			"height": 294.91489361702133,
			"seed": 1168968381,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582155,
			"link": null,
			"startBinding": {
				"elementId": "MzPLXSNmaYI3x5j7IS6Gf",
				"gap": 26.747720364741646,
				"focus": 0.4509135972771257
			},
			"endBinding": {
				"elementId": "V1N4pQLTBnsqPPFQnGGnc",
				"gap": 1.3373860182370825,
				"focus": 0.7291648013013952
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					1.5717855113028918,
					294.91489361702133
				]
			]
		},
		{
			"type": "arrow",
			"version": 301,
			"versionNonce": 374592408,
			"isDeleted": false,
			"id": "84LQyjwcO8EY7BdnH8fTO",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 81.04175400644908,
			"y": 2052,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 1.4210854715202004e-14,
			"height": 163.68387975804671,
			"seed": 65269363,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582155,
			"link": null,
			"startBinding": {
				"elementId": "V1N4pQLTBnsqPPFQnGGnc",
				"gap": 32,
				"focus": 0.01756518822264886
			},
			"endBinding": {
				"elementId": "-qtUng8hg1MkfE4hitN20",
				"gap": 24.3161202419535,
				"focus": -0.1352122470461783
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-1.4210854715202004e-14,
					163.68387975804671
				]
			]
		},
		{
			"type": "arrow",
			"version": 1016,
			"versionNonce": 1110109080,
			"isDeleted": false,
			"id": "E3_KOPE6IZ1SBbe6qTyAn",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 3.0509464204647276,
			"x": 3383.710787546777,
			"y": 1551.4215058056454,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 539.5826406123647,
			"height": 48.58165670222729,
			"seed": 1850611805,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582147,
			"link": null,
			"startBinding": {
				"elementId": "pLzgoDWL8Q7SrIH2_MXUB",
				"gap": 7.434648657448109,
				"focus": -0.08238960611300997
			},
			"endBinding": {
				"elementId": "-agTPa_xRCW7PE6gAr6Zo",
				"gap": 19.59571417625864,
				"focus": 0.5151079553726803
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"points": [
				[
					0,
					0
				],
				[
					-539.5826406123647,
					48.58165670222729
				]
			]
		},
		{
			"type": "line",
			"version": 202,
			"versionNonce": 76645085,
			"isDeleted": false,
			"id": "pxWLu6uJi9PS_aAmZ0glc",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 1.4232602421367222,
			"x": 4181.0210598798785,
			"y": 2231.302372371522,
			"strokeColor": "#495057",
			"backgroundColor": "#ced4da",
			"width": 439.00952742597747,
			"height": 388.00556988186463,
			"seed": 2062893757,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653458208980,
			"link": null,
			"startBinding": null,
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"points": [
				[
					0,
					0
				],
				[
					439.00952742597747,
					388.00556988186463
				]
			]
		},
		{
			"type": "rectangle",
			"version": 179,
			"versionNonce": 1768056179,
			"isDeleted": false,
			"id": "sSnZZwHBKMaVPqyZA1wzn",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1420,
			"y": 1340,
			"strokeColor": "#1864ab",
			"backgroundColor": "#fab005",
			"width": 520,
			"height": 380,
			"seed": 957731219,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "RWGA4yyd"
				},
				{
					"id": "4Hx6w3W1oTgG1kVJZE7nb",
					"type": "arrow"
				}
			],
			"updated": 1653458208980,
			"link": null
		},
		{
			"type": "text",
			"version": 269,
			"versionNonce": 544677693,
			"isDeleted": false,
			"id": "RWGA4yyd",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1415,
			"y": 1461.5,
			"strokeColor": "#1864ab",
			"backgroundColor": "#ced4da",
			"width": 510,
			"height": 137,
			"seed": 2080080947,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458208980,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "All Rows from All Files\nwith the same File Format\ncombined as one big table",
			"rawText": "All Rows from All Files\nwith the same File Format\ncombined as one big table",
			"baseline": 123,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "sSnZZwHBKMaVPqyZA1wzn",
			"originalText": "All Rows from All Files\nwith the same File Format\ncombined as one big table"
		},
		{
			"type": "arrow",
			"version": 285,
			"versionNonce": 137810408,
			"isDeleted": false,
			"id": "4Hx6w3W1oTgG1kVJZE7nb",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -913.8040315209605,
			"y": 1338.642857142857,
			"strokeColor": "#495057",
			"backgroundColor": "#ced4da",
			"width": 133.8040315209605,
			"height": 118.64285714285711,
			"seed": 1037740051,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582156,
			"link": null,
			"startBinding": {
				"elementId": "sSnZZwHBKMaVPqyZA1wzn",
				"gap": 1.357142857142857,
				"focus": 0.06406685236768803
			},
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					133.8040315209605,
					-118.64285714285711
				]
			]
		},
		{
			"type": "rectangle",
			"version": 290,
			"versionNonce": 1489346712,
			"isDeleted": false,
			"id": "Ag5xlLZsUm3JVkS3XcIQh",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": -2493,
			"y": 173.00000000000114,
			"strokeColor": "#e67700",
			"backgroundColor": "#4c6ef5",
			"width": 1340,
			"height": 114,
			"seed": 1139389853,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "UzzoW1xC",
					"type": "text"
				}
			],
			"updated": 1653462582156,
			"link": null
		},
		{
			"type": "text",
			"version": 268,
			"versionNonce": 945050856,
			"isDeleted": false,
			"id": "UzzoW1xC",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": -2488,
			"y": 207.00000000000114,
			"strokeColor": "#e67700",
			"backgroundColor": "#4c6ef5",
			"width": 1330,
			"height": 46,
			"seed": 283885235,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462582157,
			"link": null,
			"fontSize": 36.00000000000008,
			"fontFamily": 1,
			"text": "EXTRACT",
			"rawText": "EXTRACT",
			"baseline": 32,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "Ag5xlLZsUm3JVkS3XcIQh",
			"originalText": "EXTRACT"
		},
		{
			"type": "rectangle",
			"version": 504,
			"versionNonce": 1075327325,
			"isDeleted": false,
			"id": "oul8bRoFLvzDPqMi68DWz",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": -2710,
			"y": 1810,
			"strokeColor": "#e67700",
			"backgroundColor": "#4c6ef5",
			"width": 1760,
			"height": 100,
			"seed": 1096637427,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "HiJ4WyMU"
				}
			],
			"updated": 1653458214970,
			"link": null
		},
		{
			"type": "text",
			"version": 543,
			"versionNonce": 298049267,
			"isDeleted": false,
			"id": "HiJ4WyMU",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": -2705,
			"y": 1837,
			"strokeColor": "#e67700",
			"backgroundColor": "#4c6ef5",
			"width": 1750,
			"height": 46,
			"seed": 2100659315,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458214970,
			"link": null,
			"fontSize": 36.00000000000008,
			"fontFamily": 1,
			"text": "TRANSFORM",
			"rawText": "TRANSFORM",
			"baseline": 32,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "oul8bRoFLvzDPqMi68DWz",
			"originalText": "TRANSFORM"
		},
		{
			"type": "rectangle",
			"version": 617,
			"versionNonce": 2022672851,
			"isDeleted": false,
			"id": "EUFwkaPdRMRW5wCmfwRnp",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": -2630,
			"y": 3610,
			"strokeColor": "#e67700",
			"backgroundColor": "#4c6ef5",
			"width": 1580,
			"height": 80,
			"seed": 1143209405,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "UVUgS4GD",
					"type": "text"
				}
			],
			"updated": 1653458336098,
			"link": null
		},
		{
			"type": "text",
			"version": 659,
			"versionNonce": 1097134301,
			"isDeleted": false,
			"id": "UVUgS4GD",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": -2625,
			"y": 3627,
			"strokeColor": "#e67700",
			"backgroundColor": "#4c6ef5",
			"width": 1570,
			"height": 46,
			"seed": 2121369747,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653458336099,
			"link": null,
			"fontSize": 36.00000000000008,
			"fontFamily": 1,
			"text": "LOAD",
			"rawText": "LOAD",
			"baseline": 32,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "EUFwkaPdRMRW5wCmfwRnp",
			"originalText": "LOAD"
		},
		{
			"type": "arrow",
			"version": 368,
			"versionNonce": 1702219160,
			"isDeleted": false,
			"id": "V_TF8SJ3nwIFveTBnchCn",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1518.9279043292058,
			"y": 3933.539780367168,
			"strokeColor": "#000000",
			"backgroundColor": "#4c6ef5",
			"width": 141.5641155718463,
			"height": 472.4700799677544,
			"seed": 673577309,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653462582158,
			"link": null,
			"startBinding": {
				"elementId": "AV8OT3Vb5TyMUbh_l0acJ",
				"gap": 20,
				"focus": -0.8284587121603934
			},
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					-141.5641155718463,
					-472.4700799677544
				]
			]
		},
		{
			"type": "rectangle",
			"version": 216,
			"versionNonce": 2079419581,
			"isDeleted": false,
			"id": "AV8OT3Vb5TyMUbh_l0acJ",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1500,
			"y": 3940,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 760,
			"height": 300,
			"seed": 1742946163,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "pUsdWUQK"
				},
				{
					"id": "V_TF8SJ3nwIFveTBnchCn",
					"type": "arrow"
				}
			],
			"updated": 1653458262180,
			"link": null
		},
		{
			"type": "text",
			"version": 286,
			"versionNonce": 782849688,
			"isDeleted": false,
			"id": "pUsdWUQK",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -1495,
			"y": 4021.5,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 750,
			"height": 137,
			"seed": 1846499421,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571258,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "What is the \"Load\"?? How do I get the \nnew transactions into the Transactions \ntable?",
			"rawText": "What is the \"Load\"?? How do I get the new transactions into the Transactions table?",
			"baseline": 123,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "AV8OT3Vb5TyMUbh_l0acJ",
			"originalText": "What is the \"Load\"?? How do I get the new transactions into the Transactions table?"
		},
		{
			"type": "rectangle",
			"version": 269,
			"versionNonce": 1211721917,
			"isDeleted": false,
			"id": "DfoglR5Gaolu3Ru7utMw3",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -640,
			"y": 3220,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 760,
			"height": 300,
			"seed": 1004852893,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "jQqSAQLX",
					"type": "text"
				},
				{
					"id": "V_TF8SJ3nwIFveTBnchCn",
					"type": "arrow"
				}
			],
			"updated": 1653458271605,
			"link": null
		},
		{
			"type": "text",
			"version": 334,
			"versionNonce": 1815019240,
			"isDeleted": false,
			"id": "jQqSAQLX",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -635,
			"y": 3301.5,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 750,
			"height": 137,
			"seed": 40840627,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571259,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "What is the \"Load\"?? How do I get the \nnew transactions into the Transactions \ntable?",
			"rawText": "What is the \"Load\"?? How do I get the new transactions into the Transactions table?",
			"baseline": 123,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "DfoglR5Gaolu3Ru7utMw3",
			"originalText": "What is the \"Load\"?? How do I get the new transactions into the Transactions table?"
		},
		{
			"type": "ellipse",
			"version": 23,
			"versionNonce": 468739027,
			"isDeleted": false,
			"id": "U3FFBeMFPjsNcYwSFiuLH",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 400,
			"y": 3700,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 820,
			"height": 640,
			"seed": 1536835987,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "QjrNg8pP"
				}
			],
			"updated": 1653458294026,
			"link": null
		},
		{
			"type": "text",
			"version": 97,
			"versionNonce": 1903346584,
			"isDeleted": false,
			"id": "QjrNg8pP",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 405,
			"y": 3974.5,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 810,
			"height": 91,
			"seed": 824361843,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571259,
			"link": null,
			"fontSize": 36,
			"fontFamily": 1,
			"text": "User Copies New Transactions back to \n`Transactions` Filter.",
			"rawText": "User Copies New Transactions back to `Transactions` Filter.",
			"baseline": 78,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "U3FFBeMFPjsNcYwSFiuLH",
			"originalText": "User Copies New Transactions back to `Transactions` Filter."
		},
		{
			"type": "ellipse",
			"version": 55,
			"versionNonce": 712905181,
			"isDeleted": false,
			"id": "GzBZSaK2S0L4dIjSLiR1x",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1240,
			"y": 3660,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 280,
			"height": 280,
			"seed": 378275133,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"type": "text",
					"id": "V44NRHcT"
				}
			],
			"updated": 1653458322607,
			"link": null
		},
		{
			"type": "text",
			"version": 151,
			"versionNonce": 650043880,
			"isDeleted": false,
			"id": "V44NRHcT",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 1245,
			"y": 3750.5,
			"strokeColor": "#000000",
			"backgroundColor": "transparent",
			"width": 270,
			"height": 99,
			"seed": 1928205459,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571260,
			"link": null,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "The `slug` will prevent the\npreviously imported \nTransactions from showing \nup again!",
			"rawText": "The `slug` will prevent the previously imported Transactions from showing up again!",
			"baseline": 92,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "GzBZSaK2S0L4dIjSLiR1x",
			"originalText": "The `slug` will prevent the previously imported Transactions from showing up again!"
		},
		{
			"type": "line",
			"version": 344,
			"versionNonce": 706350483,
			"isDeleted": false,
			"id": "emwjXDJrjeHkC5lagX8bw",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -2100,
			"y": 940,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#fd7e14",
			"width": 7160,
			"height": 0.8264038827270497,
			"seed": 875980243,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653458483445,
			"link": null,
			"startBinding": null,
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"points": [
				[
					0,
					0
				],
				[
					7160,
					0.8264038827270497
				]
			]
		},
		{
			"type": "line",
			"version": 403,
			"versionNonce": 1052402269,
			"isDeleted": false,
			"id": "43b6RzLg4D8hozoybRsom",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -2100,
			"y": 2800,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#fd7e14",
			"width": 7460,
			"height": 0,
			"seed": 1485172179,
			"groupIds": [],
			"strokeSharpness": "round",
			"boundElements": [],
			"updated": 1653458489112,
			"link": null,
			"startBinding": null,
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"points": [
				[
					0,
					0
				],
				[
					7460,
					0
				]
			]
		},
		{
			"type": "rectangle",
			"version": 699,
			"versionNonce": 290563069,
			"isDeleted": false,
			"id": "Y_AnhXtCvhbFgTbuSJMTh",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": 690,
			"y": 1810,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 1740,
			"height": 120,
			"seed": 240987517,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [
				{
					"id": "ary7Y3Bq",
					"type": "text"
				},
				{
					"id": "RDoj4kCL3e-IyLMI94yg6",
					"type": "arrow"
				},
				{
					"id": "y3SmxuaWomM5ItSpBYxIp",
					"type": "arrow"
				},
				{
					"id": "_4484EY65uSrA--Jtfmt0",
					"type": "arrow"
				},
				{
					"id": "EWRPnwVNXI2AHo_SY7hgk",
					"type": "arrow"
				},
				{
					"id": "10rfbBw_Lzkjf5kT_CIN6",
					"type": "arrow"
				},
				{
					"id": "oEcslAaFMe-v6ozB6eckI",
					"type": "arrow"
				},
				{
					"id": "_zHmmb_uUhlR7eqIu40FZ",
					"type": "arrow"
				},
				{
					"id": "dXpWBN-nZX6YA5nCaWcMs",
					"type": "arrow"
				},
				{
					"id": "84LQyjwcO8EY7BdnH8fTO",
					"type": "arrow"
				}
			],
			"updated": 1653458449001,
			"link": null
		},
		{
			"type": "text",
			"version": 931,
			"versionNonce": 1384550552,
			"isDeleted": false,
			"id": "ary7Y3Bq",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "dotted",
			"roughness": 1,
			"opacity": 100,
			"angle": 4.71238898038469,
			"x": 695,
			"y": 1823,
			"strokeColor": "#495057",
			"backgroundColor": "#fd7e14",
			"width": 1730,
			"height": 94,
			"seed": 1936995539,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"boundElements": [],
			"updated": 1653462571260,
			"link": null,
			"fontSize": 75.92079207920803,
			"fontFamily": 1,
			"text": "Magic",
			"rawText": "Magic",
			"baseline": 67,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "Y_AnhXtCvhbFgTbuSJMTh",
			"originalText": "Magic"
		},
		{
			"id": "xBceiKqWK0R69LIkboLxW",
			"type": "rectangle",
			"x": 1760,
			"y": -840,
			"width": 2040,
			"height": 920,
			"angle": 0,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#fd7e14",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"seed": 1801086184,
			"version": 35,
			"versionNonce": 2045128856,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "CYcm62jP"
				}
			],
			"updated": 1653462580955,
			"link": null
		},
		{
			"id": "CYcm62jP",
			"type": "text",
			"x": 1765,
			"y": -403,
			"width": 2030,
			"height": 46,
			"angle": 0,
			"strokeColor": "#5f3dc4",
			"backgroundColor": "#fd7e14",
			"fillStyle": "hachure",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"strokeSharpness": "sharp",
			"seed": 2072819688,
			"version": 32,
			"versionNonce": 630741656,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1653462583257,
			"link": null,
			"text": "Whyer is VALIDATION?",
			"rawText": "Whyer is VALIDATION?",
			"fontSize": 36,
			"fontFamily": 1,
			"textAlign": "center",
			"verticalAlign": "middle",
			"baseline": 32,
			"containerId": "xBceiKqWK0R69LIkboLxW",
			"originalText": "Whyer is VALIDATION?"
		}
	],
	"appState": {
		"theme": "light",
		"viewBackgroundColor": "#ffffff",
		"currentItemStrokeColor": "#5f3dc4",
		"currentItemBackgroundColor": "#fd7e14",
		"currentItemFillStyle": "hachure",
		"currentItemStrokeWidth": 2,
		"currentItemStrokeStyle": "dashed",
		"currentItemRoughness": 1,
		"currentItemOpacity": 100,
		"currentItemFontFamily": 1,
		"currentItemFontSize": 36,
		"currentItemTextAlign": "left",
		"currentItemStrokeSharpness": "sharp",
		"currentItemStartArrowhead": null,
		"currentItemEndArrowhead": "arrow",
		"currentItemLinearStrokeSharpness": "round",
		"gridSize": 20,
		"colorPalette": {}
	},
	"files": {}
}
```
%%