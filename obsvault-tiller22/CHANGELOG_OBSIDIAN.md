


## CHANGES

### 2022-05-21 - Disable Plugin `Dataview`
- Interfered with copy/pasting Excel formulas.
- e.g.

```md

	```
	='Import Wizard'!$C$5=REPLACE(GET.WORKBOOK(1),1,FIND("]",GET.WORKBOOK(1)),"")
	```

```



