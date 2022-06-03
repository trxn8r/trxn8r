---
page-title: "Table.SelectRows - PowerQuery M | Microsoft Docs"
url: https://docs.microsoft.com/en-us/powerquery-m/table-selectrows
date: "2022-06-01 19:50:22"
---
## Table.SelectRows

-   Article
-   05/20/2022
-   2 minutes to read

## [](https://docs.microsoft.com/en-us/powerquery-m/table-selectrows#syntax)Syntax

Table.SelectRows(**table** as table, **condition** as function) as table

## [](https://docs.microsoft.com/en-us/powerquery-m/table-selectrows#about)About

Returns a table of rows from the `table`, that matches the selection `condition`.

## [](https://docs.microsoft.com/en-us/powerquery-m/table-selectrows#example-1)Example 1

Select the rows in the table where the values in \[CustomerID\] column are greater than 2.

**Usage**

```
Table.SelectRows(
    Table.FromRecords({
        [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
        [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
        [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
        [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
    }),
    each [CustomerID] > 2
)
```

**Output**

```
Table.FromRecords({
    [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
    [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
})
```

## [](https://docs.microsoft.com/en-us/powerquery-m/table-selectrows#example-2)Example 2

Select the rows in the table where the names do not contain a "B".

**Usage**

```
Table.SelectRows(
    Table.FromRecords({
        [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
        [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
        [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
        [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
    }),
    each not Text.Contains([Name], "B")
)
```

**Output**

```
Table.FromRecords({
    [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
    [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
    [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
})
```