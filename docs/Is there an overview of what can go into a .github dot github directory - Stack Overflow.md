---
page-title: "Is there an overview of what can go into a .github \"dot github\" directory? - Stack Overflow"
url: https://stackoverflow.com/questions/60507097/is-there-an-overview-of-what-can-go-into-a-github-dot-github-directory
date: "2022-06-01 21:03:57"
---

> On Github, folder `.github` is just a convention folder used to place Github related stuff inside it. Github handles some of these files even when you place it in root of your project (*such as `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` etc*). Because Github is constantly bringing in new features, these features are documented on their own, so there is no *"all possible files in .github"* page. Feel free to place anything that is related to **Github** specifically inside it.
> 
> Some of the most used files in `.github` folder:
> 
> -   `CODE_OF_CONDUCT.md` -> How to engage in community and how to behave yourself.
> -   `CONTRIBUTING.md` -> How to contribute to repo (*making pull request, setting development environment...*)
> -   `LICENSE.md` - A software license tells others what they can and can't do with your source code (*You should place this at the root of your project since GitHub ignores it in `.github` folder. You can find this file while browsing other Git hosting services such as GitLab, Bitbucket etc.*)
> -   `FUNDING.yml` -> Supporting a project
> -   `ISSUE_TEMPLATE` -> Folder that contains a templates of possible issues user can use to open issue (*such as if issue is related to documentation, if it's a bug, if user wants new feature etc*) P.S. Take a look at tensorflow [ISSUE\_TEMPLATE](https://github.com/tensorflow/tensorflow/tree/f3fd82f65724cdba600fdd23d251c2b01152ed3c/.github/ISSUE_TEMPLATE)
> -   `PULL_REQUEST_TEMPLATE.md` -> How to make a pull request to project
> -   `stale.yml` -> Probot configuration to close stale issues. There are many other apps on Github Marketplace that place their configurations inside `.github` folder because they are related to GitHub specifically.
> -   `SECURITY.md` -> How to responsibly report a security vulnerability in project
> -   `workflows` -> Configuration folder containing yaml files for GitHub Actions
> -   `CODEOWNERS` -> Pull request reviewer rules. More info [here](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners).
> -   `dependabot.yml` -> Configuration options for dependency updates. More info [here](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/configuration-options-for-dependency-updates).
