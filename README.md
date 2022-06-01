# README TRX8NR

## Tiller's 2022 Microsoft Excel Builders Challenge Entry

_by [Greg Stevens](https://www.stevens.pro/) a.k.a. [@GregSweats](https://github.com/GregSweats)_

---

> #SpreadsheetNerdsUnite
>
> _[Announcing Tiller’s 2022 Microsoft Excel Builders Challenge](https://www.tillerhq.com/announcing-tillers-2022-microsoft-excel-builders-challenge/)_

---


## 1️⃣ Getting Started as a `User`

_⚠ The first hit is always free._

### 1.1. Download the `TRX8NR 🐱‍🐉` Excel Workbook

<p class="callout info">

1. 🔗 [Download the TRXN8R Excel Workbook `.xlsx`](./TRXN8R%20-%20Bulk%20Import%20CSV%20Transactions%20v22.6.1-alpha.2.xlsx)

</p>

### 1.2. Configure TRX8NR to ~~Load~~ Chew On & Digest Your Transactions
From the main screen, the workbook in the screenshot, `TRX8NR Home`

1. **`Foundation/Transactions Workbook File Path`**
   1. The location of your [Tiller Foundation Template](https://www.tillerhq.com/introducing-the-tiller-foundation-template-for-microsoft-excel/)
   with a `Transactions Worksheet`.

   2. The `Transactions` from this worksheet will be used to determine:
      1. `Column Headers` for mapping the `CSV Files` to.
      2. `Transaction History` to **avoid importing `Transactions` that already exist**.
      4. ⚠ **`TRX8NR` ~~WILL~~ SHOULD NOT MODIFY YOUR DATA!**
         1. Still in beta as of 2022-06-01 so mistakes may happen.
      3. After the import, `TRXN8R` loads the `` Worksheet with **new, de-duplicated Transactions, in the same column format for easy copy/paste back into your actual data**.
      4. Review the Imported Transactions, add them back to your `Foundation/Transactions Workbook`, and voile, we should succeed! 🏆

   3.  consumed from [`data/to-import/`](data/to-import/) will be compared to the **`Transactions Worksheet`** in this `Foundation Template`.

2. **`Pick Transactions Worksheet`**
   1. ✅ **Any Custom Headers/Ordering Works**
      2. 🤯 TRX8NR loads the headers from the `Transactions Worksheet` into the next step, the `TRX8NR ImportConfigs Worksheet`, where you can set what `CSV Header` to use for this `Transactions Header` .
      1. _#beta may be buggy 🐛_

   2. Pick the `Worksheet` to use from the `Foundation Template`.
      1. _This should be a drop-down list but it may be buggy 🐛_

3. **`Folder Path to Import From`**
   1. 🔧 The `Windows Directory` where your `CSV Files` are located.
   2. 🐱‍🐉 TRXN8R will scan all sub-directories too. #feature

4. **`Config to Use`**
   1. 🚧 #WorkInProgress
   2. Goal is to have `T8R` let you map different configs to different files, based on patterns, paths, and a final manual `YES/NO` confirmation somehow #maybe.
   3.

5. **`Refresh Data`**

6. **`Review Results`**





[![TRX8NR Screenshot](obsvault-tiller22/_assets/screencasts/../screenshots/keep/TRXN8R%20Screenshot.png)](obsvault-tiller22/_assets/screenshots/keep/TRXN8R%20Screenshot.png)

---
---
---

## 2️⃣ All the Contents

- [Tiller's 2022 Microsoft Excel Builders Challenge Entry](#tillers-2022-microsoft-excel-builders-challenge-entry)
- [1️⃣ Getting Started as a `User`](#1️⃣-getting-started-as-a-user)
  - [1.1. Download the `TRX8NR 🐱‍🐉` Excel Workbook](#11-download-the-trx8nr--excel-workbook)
  - [1.2. Configure TRX8NR to ~~Load~~ Chew On & Digest Your Transactions](#12-configure-trx8nr-to-load-chew-on--digest-your-transactions)
- [2️⃣ All the Contents](#2️⃣-all-the-contents)
- [3️⃣ Issues, Help, Discussions, etc.](#3️⃣-issues-help-discussions-etc)
- [4️⃣ Obsidian Vault](#4️⃣-obsidian-vault)
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

## 3️⃣ Issues, Help, Discussions, etc.

- [Issues · trxn8r/trxn8r](https://github.com/trxn8r/trxn8r/issues)
- [Projects · trxn8r](https://github.com/trxn8r/trxn8r/projects?type=beta)



## 4️⃣ Obsidian Vault

[`./obsvault-tiller22/`](obsvault-tiller22/)


- Glance at the [Obsidian Vault `./obsvault-tiller22/`](obsvault-tiller22/)
- That `"Vault"` is where [Obsidian.md](https://obsidian.md/) magic comes into play.
- Install/Open [`Obsidian` _(for free)_](https://obsidian.md/) and then `"Open folder as vault"` and open the vault folder [`./obsvault-tiller22./`](obsvault-tiller22/).


#### Example 2022-06-01 - Open Folder as Vault, Freshly Cloned Repo
![Getting Started with Obsidian](obsvault-tiller22/_assets/screencasts/2022-06-01%20-%20Getting%20Started%20-%20Open%20Obsidian%20Vault%20Demo.gif)



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


> _👉 Checkout the [Obsidian Vault]() for more, and up-to-date information._


![obsvault-tiller22/2022-05-24 Importer Workflow Diagram.png](obsvault-tiller22/2022-05-24%20Importer%20Workflow%20Diagram.png)

![obsvault-tiller22/2022-05-24 Diagram of What Importer Should Do](obsvault-tiller22/diagrams/2022-05-24%20Diagram%20of%20What%20Importer%20Should%20Do.png)

![obsvault-tiller22/diagrams/Overview1 After PowerQuery Model 2022-05-22.excalidraw.thumb.png](obsvault-tiller22/diagrams/Overview1%20After%20PowerQuery%20Model%202022-05-22.excalidraw.thumb.png)


---