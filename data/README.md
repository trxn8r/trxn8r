# README `/data/`

## Tiller Sample Data File

> https://www.tillerhq.com/budget-sheet-sample-data-for-google-sheets-and-excel/

## Files Ignored by Git
Use the force flag, i.e. `git add --force data/some-file-you-want-to-keep.csv`  to add files in data.

>
> ```
> 8e204bc (HEAD -> main)
> chore(git): � git ignore the data* directory, except for data/samples
> ```

### Example #ShellOutput
_2022-06-01_

```powershell
AzureAD+GregStevens@benny-win MINGW64 /c/Users/GregStevens/OneDrive - Dalyle/projects/trxn8r (main)
$
git add -f data/README.md

$
git status -s

AM data/README.md
 M obsvault-tiller22/.obsidian/app.json
 M obsvault-tiller22/.obsidian/appearance.json
 M obsvault-tiller22/.obsidian/community-plugins.json
 M obsvault-tiller22/.obsidian/hotkeys.json

AzureAD+GregStevens@benny-win MINGW64 /c/Users/GregStevens/OneDrive - Dalyle/projects/trxn8r (main)
$
```