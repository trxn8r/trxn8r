# README - Tiller Challenge 2022

> #SpreadsheetNerdsUnite
> _-- https://www.tillerhq.com_

---

**Contents**
- [Obsidian Vault](#obsidian-vault)
- [Getting Started](#getting-started)
  - [Download ZIP, Excel, or Git Clone the Repo](#download-zip-excel-or-git-clone-the-repo)
    - [Git Clone the Repo](#git-clone-the-repo)
      - [Example](#example)
    - [Caveats](#caveats)
      - [Avoid Usually Cloning into a OneDrive Folder](#avoid-usually-cloning-into-a-onedrive-folder)
- [Goals / Thoughts](#goals--thoughts)
  - ["Making Of" YouTube Playlist (Hours...⏳)](#making-of-youtube-playlist-hours)
- [Diagram Samples (`/diagrams/`)](#diagram-samples-diagrams)

---

## Obsidian Vault

- Please Also See the [Obsidian Vault `.(obsvault-tiller22/`](obsvault-tiller22/).
- That `"Vault"` is where [Obsidian.md](https://obsidian.md/) magic comes into play.
- Install/Open `Obsidian` _(for free)_ and then `"Open folder as vault"` and open the vault folder [`./obsvault-tiller22./`](obsvault-tiller22/).
- I am _**the**_ README is for the [GitHub Repo `trxn8r/trxn8r`](https://github.com/trxn8r/trxn8r).
- This contains information for [Contributing](#Contributing), [
  Also see [`obsvault-tiller22/README.md`](obsvault-tiller22/README.md)

---

_Nicer keeping all documentation within wonderful [Obsidian](https://obsidian.md) 👩‍🏭._

Sincerely,

Greg Stevens
<br>@gsteve3
<br>2022-05-22 at 01:08:07 AM MDT
<br>[https://career.stevens.pro/](https://career.stevens.pro/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub)


---

## Getting Started
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

##### Avoid Usually Cloning into a OneDrive Folder
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

- Windows Friendly Naming
  - e.g. `Create a new ` __`folder`__ rather than `directory` (Linux/Web terminology I think 🤔❓)
  - Models after `Windows Explorer's` __"New folder"__ button.
    - #todo: Any reference for this?
- Leverage `Microsoft Office 365 (0365)` Services
    - Cloud, local, apps, whatever.
    - Workflows, commenting, approving, todos.
    - Outlook/Email Integration (forward receipts, etc...) #dreaming #future
    - [OneDrive Vaults](https://www.microsoft.com/en-ca/microsoft-365/onedrive/personal-vault?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub)
    - etc.
- Be __User Friendly__
  - `TRX8NR` was created for [Tiller’s 2022 Microsoft Excel Builders Challenge](https://www.tillerhq.com/announcing-tillers-2022-microsoft-excel-builders-challenge/?utm_campaign=TRXN8R&utm_source=github.com/trxn8r/trxn8r/blob/main/README.md&utm_medium=GitHub) 🔗
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
    -

### "Making Of" YouTube Playlist (Hours...⏳)
https://www.youtube.com/playlist?list=PLqKgLp9aiBB_p4vwWgQRC-qefa2es9ziC

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/videoseries?list=PLqKgLp9aiBB_p4vwWgQRC-qefa2es9ziC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


---


## Diagram Samples (`/diagrams/`)


> _👉 Checkout the [Obsidian Vault]() for more, and up-to-date information._


![obsvault-tiller22/2022-05-24 Importer Workflow Diagram.png](obsvault-tiller22/2022-05-24%20Importer%20Workflow%20Diagram.png)

![obsvault-tiller22/2022-05-24 Diagram of What Importer Should Do](obsvault-tiller22/diagrams/2022-05-24%20Diagram%20of%20What%20Importer%20Should%20Do.png)

![obsvault-tiller22/diagrams/Overview1 After PowerQuery Model 2022-05-22.excalidraw.thumb.png](obsvault-tiller22/diagrams/Overview1%20After%20PowerQuery%20Model%202022-05-22.excalidraw.thumb.png)


---