

> If you notice that loading a query to a Data Model takes much longer than loading to a worksheet, check your Power Query steps to see if you are filtering a text column or a List structured column by using a **Contains** operator. This action causes Excel to enumerate again through the entire data set for each row. Furthermore, Excel can’t effectively use multithreaded execution. As a workaround, try using a different operator such as **Equals** or **Begins With**.
> 
> Microsoft is aware of this problem and it is under investigation.
>
> -- https://support.microsoft.com/en-us/office/create-load-or-edit-a-query-in-excel-power-query-ca69e0f0-3db1-4493-900c-6279bef08df4#supAppliesToTableContainer



