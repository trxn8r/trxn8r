# README - Transactionator (`TRXN8R`)

## Tiller's 2022 Microsoft Excel Builders Challenge Entry

_**by [Greg Stevens](https://www.stevens.pro/) a.k.a. [@GregSweats](https://github.com/GregSweats)**_

---

> #SpreadsheetNerdsUnite
>
> _[Announcing Tiller’s 2022 Microsoft Excel Builders Challenge](https://www.tillerhq.com/announcing-tillers-2022-microsoft-excel-builders-challenge/)_

---

## 🔗 Download Latest TRXN8R Excel from Releases

>
> **[DOWNLOAD `TRXN8R.SOME_VERSION.xlsx` from `Releases`](https://github.com/trxn8r/trxn8r/releases)**
>
> Look under the expandable **Assets** section.
>
> &nbsp;
>

⚠ Two warnings may popup
1. `Enable Editing`
   1. This is because the file was downloaded.
2. `Enable Content`
   1. This is to allow access to External Content, the `Transactions Workbook` you will configure.

---

## Screenshot

[![TRX8NR Screenshot #1](docs/_assets/screenshots/keep/TRXN8R%20Screenshot.png)](docs/_assets/screenshots/keep/TRXN8R%20Screenshot.png)

> 🤯 _Yesssss, this is Microsoft Excel._
>
> _Ever seen a spreadsheet with a **SEIZURE WARNING**? That one Dino GIF is a lot to take in._

---

## Table of Contents

- [Tiller's 2022 Microsoft Excel Builders Challenge Entry](#tillers-2022-microsoft-excel-builders-challenge-entry)
- [🔗 Download Latest TRXN8R Excel from Releases](#-download-latest-trxn8r-excel-from-releases)
- [Screenshot](#screenshot)
- [Table of Contents](#table-of-contents)
- [Why?](#why)
- [1️⃣ Getting Started as a `User`](#1️⃣-getting-started-as-a-user)
  - [1.1. Download the Excel Workbook](#11-download-the-excel-workbook)
  - [1.2. Configure `TRX8NR 🐱‍🐉` to Extract, Transform, and Load (`ETL`) the Results of Your Transactions (`Trxns`)](#12-configure-trx8nr--to-extract-transform-and-load-etl-the-results-of-your-transactions-trxns)
- [2️⃣ Issues, Help, Discussions, etc.](#2️⃣-issues-help-discussions-etc)
- [3️⃣ Obsidian Vault](#3️⃣-obsidian-vault)
    - [Example 2022-06-01 - Open Folder as Vault, Freshly Cloned Repo](#example-2022-06-01---open-folder-as-vault-freshly-cloned-repo)
- [Contributing](#contributing)
- [Getting Started as a `Developer`](#getting-started-as-a-developer)
  - [Download ZIP, Excel, or Git Clone the Repo](#download-zip-excel-or-git-clone-the-repo)
    - [Git Clone the Repo](#git-clone-the-repo)
      - [Example](#example)
    - [Caveats](#caveats)
      - [Usually Avoid Cloning into a OneDrive Folder](#usually-avoid-cloning-into-a-onedrive-folder)
- [Goals / Thoughts](#goals--thoughts)
- [Diagram Samples (`/diagrams/`)](#diagram-samples-diagrams)

---


## Why?

> Best to see [https://career.stevens.pro/tiller](https://career.stevens.pro/organizations/tiller/README#UPDATE+2022-05-22+ENTERING+BUILDER+CHALLENGE+2022)


[![Diagram PQ Model Overview](docs/diagrams/Overview1%20After%20PowerQuery%20Model%202022-05-22.excalidraw.png)](https://career.stevens.pro/organizations/tiller/README)


---
---
---

## 1️⃣ Getting Started as a `User`

_⚠ The first hit is always free._

### 1.1. Download the Excel Workbook

> ⭐ [Download `TRXN8R.xlsx`](https://github.com/trxn8r/trxn8r/raw/main/TRXN8R.xlsx)

- **LATEST VERSION** will always be the only `.xlsx` in the root of this project.
- `/TRXN8R.xlsx` is a copy/paste alias, a gross, crude, redirect.
- I think having the version in the name is good, especially when filing issues or knowing when to update.
- Could be a hidden, checkable value within a cell or Power Query Param though...hmmmm...



### 1.2. Configure `TRX8NR 🐱‍🐉` to Extract, Transform, and Load (`ETL`) the Results of Your Transactions (`Trxns`)

From the main screen, the workbook in the screenshot, `TRX8NR Home`

1. **`Foundation/Transactions Workbook File Path`**
   1. The location of your [Tiller Foundation Template](https://www.tillerhq.com/introducing-the-tiller-foundation-template-for-microsoft-excel/)
   with a `Transactions Worksheet`.

   2. The `Transactions` from this worksheet will be used to determine:
      1. `Column Headers` for mapping the `CSV Files` to.
      2. `Transaction History` to **avoid importing duplicate `Transactions`**.
      3. After the import, `TRXN8R` loads the `t8r_TrxnsFromImport` Worksheet with new, de-duplicated Transactions, **in the same column format for easy copy/paste back into your actual Transactions Worksheet data**.
      4. Review the Imported Transactions, add them back to your `Foundation/Transactions Workbook`, and voile, we should succeed! 🏆
   3. ⚠ `TRX8NR` SHOULD NOT MODIFY/OVERWRITE/DESTROY YOUR DATA!
         1. Still in beta as of 2022-06-01 so mistakes may happen.
         2. TRXN8R is designed to Load the Transactions from your Workbook only.
         3. #todo Is there a way to open the source Workbook read only?
            1. Might already be.
            2. Look in Power Query at `t8r_GetWorksheetFromTrxnsWorkbook`. We get the File.Contents and load Workbook from that...how could it write it back?!

            ```pq
            worksheet = Excel.Workbook(
              // https://docs.microsoft.com/en-us/powerquery-m/file-contents
              // File.Contents(path as text, optional options as nullable record) as binary
              File.Contents(
                  T8R_TRXNS_WORKBOOK_PATH
              ),
              true,
              true
            ){[Name=worksheetName]},
            ```
               1.

   4.  consumed from [`data/to-import/`](data/to-import/) will be compared to the **`Transactions Worksheet`** in this `Foundation Template`.

2. **`Pick Transactions Worksheet`**
   1. ✅ **Any Custom Headers/Ordering Works**
      1. 🤯 TRX8NR loads the headers from the `Transactions Worksheet` into the next step, the `TRX8NR ImportConfigs Worksheet`, where you can set what `CSV Header` to use for this `Transactions Header` .
      2. _#beta may be buggy 🐛_

   2. Pick the `Worksheet` to use from the `Foundation Template`.
      1. _This should be a drop-down list but it may be buggy 🐛_

3. **`Folder Path to Import From`**
   1. 🔧 The `Windows Directory` where your `CSV Files` are located.
   2. 🐱‍🐉 TRXN8R will scan all sub-directories too. #feature

4. **`Config to Use`**
   1. 🚧 #WorkInProgress
   2. Goal is to have `T8R` let you map different configs to different files, based on patterns, paths, and a final manual `YES/NO` confirmation somehow #maybe.

5. **`Refresh Data`**

6. **`Review Results`**



---
---
---


## 2️⃣ Issues, Help, Discussions, etc.

- [Issues · trxn8r/trxn8r](https://github.com/trxn8r/trxn8r/issues)
- [Projects · trxn8r](https://github.com/trxn8r/trxn8r/projects?type=beta)



## 3️⃣ Obsidian Vault

[`./docs/`](docs/)


- Glance at the [Obsidian Vault `./docs/`](docs/)
- That `"Vault"` is where [Obsidian.md](https://obsidian.md/) magic comes into play.
- Install/Open [`Obsidian` _(for free)_](https://obsidian.md/) and then `"Open folder as vault"` and open the vault folder [`./obsvault-tiller22./`](docs/).


#### Example 2022-06-01 - Open Folder as Vault, Freshly Cloned Repo
![Getting Started with Obsidian](docs/_assets/screencasts/2022-06-01%20-%20Getting%20Started%20-%20Open%20Obsidian%20Vault%20Demo.gif)



---



_Nicer keeping all documentation within wonderful [Obsidian](https://obsidian.md) 👩‍🏭._

Sincerely,

Greg Stevens
<br>@gsteve3
<br>2022-05-22 at 01:08:07 AM MDT
<br>[https://career.stevens.pro/](https://career.stevens.pro/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub)


---

## Contributing

> 🔗 See [`CONTRIBUTING.md`](CONTRIBUTING.md)


## Getting Started as a `Developer`
### Download ZIP, Excel, or Git Clone the Repo

#### Git Clone the Repo
> _Below uses one of my fav tools [gh - GitHub CLI], you can `git clone...` as usual if you prefer. ✌_

```powershell
gh repo clone trxn8r/trxn8r
code trxn8r
```

##### Example
```powershell
PS C:\Users\GregStevens\OneDrive - Dalyle\projects>
gh repo clone trxn8r/trxn8r
Cloning into 'trxn8r'...
remote: Enumerating objects: 506, done.
remote: Counting objects: 100% (4/4), done.
remote: Total 506 (delta 3), reused 3 (delta 3), pack-reused 502
Receiving objects: 100% (506/506), 41.58 MiB | 11.04 MiB/s, done.
Resolving deltas: 100% (105/105), done.

PS C:\Users\GregStevens\OneDrive - Dalyle\projects>


PS C:\Users\GregStevens\OneDrive - Dalyle\projects> code .\trxn8r\

// The dot and backslahses around trxn8r are not required.
// They showed up when I pressed <kbd>TAB</kbd> to auto-complete the name.
```

_Powershell example, rather than the usual `shell` Markdown language, just to be **`unique`**, hehe, get it?! ...`data [base|model|science] words`! 🤣_


#### Caveats
> _Caveat: a warning or caution; admonition. Law. a legal notice to a court or public officer to suspend a certain proceeding until the notifier ..._
>
> _-- [Oxford Learner's Dictionaries, 2022-06-01](https://www.oxfordlearnersdictionaries.com/definition/english/caveat)_

##### Usually Avoid Cloning into a OneDrive Folder
- Cloning into a [[OneDrive]] folder is something that I have had HUGE issues with before due to constant Network Activity, most noticeable whne listing directories and/or svaing files.
  - Set the parent folder to `Always available on this device`.
  - This small repo wasn't like the multi-GB one I had the problems with before.
  - I was in my garage with very poor WiFi at the time (~15-50 Mbps on a 1 GB Fiber line!).
- **I LOST NEARLY EIGHT HOURS OF WORK** a few days ago, circa [[2022-05-30]], when I was working of my usual local source drive. 😡
  - Utilizing the built-in backups, versioning, etc. that [[OneDrive]] and [[SharePoint]] offer.
    - Super nice stuff.
    - Most end users are probably storing this in OneDrive.
      - _Maybe in a [[OneDrive#Vault|OneDrive Vault]] ?!_
      - [ ] Is a [[OneDrive#Vault|OneDrive Vault]] more secure than [[Google Sheets]] in this case?! #CompetitiveResearch #Versus
- To avoid further loss, I now keep it backed up on OneDrive, where most my data lives 😇.





## Goals / Thoughts

- **MS Office / Windows Based Friendly Naming**
  - e.g. `Create a new ` __`folder`__ rather than `directory` (Linux/Web terminology I think 🤔❓)
  - Models after `Windows Explorer's` __"New folder"__ button.
    - #todo: Any reference for this?
  - e.g. `Worksheet` over `Sheet` and `Workbook` over `File` or `Spreadsheet` (#maybe ?).
- **Leverage `Microsoft Office 365 (0365)` Services**
    - Cloud, local, apps, whatever.
    - Workflows, commenting, approving, todos.
    - Outlook/Email Integration (forward receipts, etc...) #dreaming #future
    - [OneDrive Vaults](https://www.microsoft.com/en-ca/microsoft-365/onedrive/personal-vault?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub)
    - etc.
- **Be __User Friendly__**
  - `TRX8NR` was created for [Tiller’s 2022 Microsoft Excel Builders Challenge](https://www.tillerhq.com/announcing-tillers-2022-microsoft-excel-builders-challenge/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub)
  - After a review of roughly 10 financial products, Tiller was the best. At the _very least_ the data was __mine__!
  - I have done some wonky things with spreadsheets in the past,
    such as using multiple `CONCAT(...` to write hundreds of Apache Redirects, routinely, without any effort, and only having [the team](https://www.mediadog.ca/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub) fill out the old/new columns. Plus an entire [Forage U-pick Tool](https://upick.beefresearch.ca/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub) with _real scientific data created as a 10-year follow-up to a project with 10-15 years of previous data in it!
  - The creator of `trx8nr`, @GregSweats, was working on a small contribution of a mapping to a Python package, [csv2ofx](https://github.com/reubano/csv2ofx) for [EQBank.ca](https://www.eqbank.ca/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub).
    - That is a beautiful solution, and chainable into some sort of future automation pipeline, with it's  `Command Line Interface (CLI)` thanks to being [NodeJS](https://nodejs.org/) based.
    - It requires coding when certain columns change though, running [Python](https://www.python.org?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub), which, is _amazing_ and something I want to get into, largely due a-newly-admitted-to-myself [Data Science 🔍](https://duckduckgo.com/?q=Data%20Science) interest.
- Be a **Model of Best Practices** to help **make better developers** which will **make better, clearly documented, user friendly packages & apps** which will **make a better world**! 🦄
  - I, @GregSweats, don't know what I'm doing.
  - I type stuff, stuff happoens.
  - Somehow I seem to know things though.
  - So as well as **helping others** this is also a **completely selfish undertaking** to hopefully give people an interesting tool and **they will teach me howz to be betterz**!
- Help @GregSweats get a job with [Tiller](https://www.tillerhq.com)
- Help @GregSweats figure out if he is insane, or actually on to something with his various workflows.
  - Through the use of **10-20+ Hours of Screencasts** that will soon be available on [YouTube @GregWorks 4 Hour 20 Minute Non-Stop Initial, RAW, Uncut, Initial Screencast Experiment and Garage Building Finishing w/ Woodworking and Examples of Non-Verbal Communication Skills](https://www.youtube.com/watch?v=YHlK748eKaQ&t=7600s) 📽.


---


## Diagram Samples (`/diagrams/`)


- **#update 2022-06-02: These are somewhat outdated but still surprisingly close!**
- _👉 Checkout the [Obsidian Vault]() for more, and up-to-date information._

![docs/2022-05-24 Importer Workflow Diagram.png](docs/2022-05-24%20Importer%20Workflow%20Diagram.png)

![docs/2022-05-24 Diagram of What Importer Should Do](docs/diagrams/2022-05-24%20Diagram%20of%20What%20Importer%20Should%20Do.png)


---