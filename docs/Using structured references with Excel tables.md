---
page-title: "Using structured references with Excel tables"
url: https://support.microsoft.com/en-us/office/using-structured-references-with-excel-tables-f5ed2452-2337-4f71-bed3-c8ae6d2b276e
date: "2022-06-02 19:16:39"
---

> ## Qualifying structured references in calculated columns
> 
> When you create a calculated column, you often use a structured reference to create the formula. This structured reference can be unqualified or fully qualified. For example, to create the calculated column, called Commission Amount, that calculates the amount of commission in dollars, you can use the following formulas:
> 
> **Type of structured reference**
> 
> **Example**
> 
> **Comment**
> 
> Unqualified
> 
> \=\[Sales Amount\]\*\[% Commission\]
> 
> Multiplies the corresponding values from the current row.
> 
> Fully qualified
> 
> \=DeptSales\[Sales Amount\]\*DeptSales\[% Commission\]
> 
> Multiples the corresponding values for each row for both columns.
> 
> The general rule to follow is this: If you’re using structured references within a table, such as when you create a calculated column, you can use an unqualified structured reference, but if you use the structured reference outside of the table, you need to use a fully qualified structured reference.
