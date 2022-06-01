---
page-title: "List.Combine - PowerQuery M | Microsoft Docs"
url: https://docs.microsoft.com/en-us/powerquery-m/list-combine
date: "2022-05-31 13:39:40"
---

> ## List.Combine
> 
> -   Article
> -   05/20/2022
> -   2 minutes to read
> 
> ## [](https://docs.microsoft.com/en-us/powerquery-m/list-combine#syntax)Syntax
> 
> List.Combine(**lists** as list) as list
> 
> ## [](https://docs.microsoft.com/en-us/powerquery-m/list-combine#about)About
> 
> Takes a list of lists, `lists`, and merges them into a single new list.
> 
> ## [](https://docs.microsoft.com/en-us/powerquery-m/list-combine#example-1)Example 1
> 
> Combine the two simple lists {1, 2} and {3, 4}.
> 
> **Usage**
> 
> ```
> List.Combine({{1, 2}, {3, 4}})
> ```
> 
> **Output**
> 
> ```
> {
>     1,
>     2,
>     3,
>     4
> }
> ```
> 
> ## [](https://docs.microsoft.com/en-us/powerquery-m/list-combine#example-2)Example 2
> 
> Combine the two lists, {1, 2} and {3, {4, 5}}, one of which contains a nested list.
> 
> **Usage**
> 
> ```
> List.Combine({{1, 2}, {3, {4, 5}}})
> ```
> 
> **Output**
> 
> ```
> {
>     1,
>     2,
>     3,
>     {4, 5}
> }
> ```
