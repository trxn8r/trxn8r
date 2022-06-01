---
page-title: "Review Last Month's Category Actuals in the Categories Sheet - Google Sheets / Show & Tell - Tiller Community"
url: https://community.tillerhq.com/t/review-last-months-category-actuals-in-the-categories-sheet/9397
date: "2022-06-01 12:21:05"
---
**What is the goal of your workflow? What problem does it solve, or how does it help you?**  
I wanted to easily see how much I spent on a category last month right in my Categories sheet when I’m reviewing to figure out budget adjustments for this month.

**How did you come up with the idea for your workflow?**  
I got tired of flipping back and forth between tabs to look at how much I actually spent vs the budget for the current month when I do start of month planning.

The “ifs” formulas are some of my favorites in Google Sheets for doing analysis. In this case I use =sumifs just to look at last month’s totals for each category, but you could also use =averageifs and look at the average for categories for all data in your sheet.

For me, last month is usually a good indicator of what this month will be like, but I know that’s not the case for everyone.

**Please describe your workflow. What are the sheets? Does it use any custom scripts or formulas?**  
This is using only the Categories sheet with monthly budget periods in the Foundation template. I added a simple formula in each category row into a new column ("Total last month). I added this new column to the left of the first budget month column in the Categories sheet.

I’m using =abs to turn it into an absolute value since that’s how budget amounts should be entered on the Categories sheet.

```
=abs(sumifs(Transactions!E2:E,Transactions!D2:D,A2,Transactions!P2:P,"7/1/2021"))
```

I hard coded in last month as “7/1/2021” into the formula and it’s based on the position of columns in my Transactions sheet, which might be different than yours.

In my Transactions sheet

-   Column E is the Amount column
-   Column D is the Category column
-   Column P is the Month column

The above formula is in column E for all category rows in the Categories sheet. It could definitely be improved by using an =arrayformula, but I’m not a spreadsheet super nerd so I don’t really know how to write it to do that. ![:nerd_face:](https://emoji.discourse-cdn.com/apple/nerd_face.png?v=10 ":nerd_face:")

There are lots of other tweaks that could probably be made to improve this too, like having it automatically detect “last month” ![:woman_shrugging:](https://emoji.discourse-cdn.com/apple/woman_shrugging.png?v=10 ":woman_shrugging:")

**Anything else you’d like people to know?**

I find this super helpful as a start of month workflow when I’m reviewing my budget numbers, but it could also be really helpful for those who are just starting with Tiller and need help setting budget amounts for the first time.

**Is it ok for others to copy, use, and modify your workflow?**

Yes!

**If you said yes above, please make a copy of your workflow and share the copy’s URL:**

You can access a copy of the sheet where I added this workflow via the link below and make a copy to review the formulas and play around with it. Please don’t click “request access” because I don’t use the email for this demo account and you can get access by making a copy from the File menu. This is the demo I sheet I use for our [weekly webinar 2](https://community.tillerhq.com/t/free-weekly-webinar-tiller-money-foundations/2658/6) ![:slight_smile:](https://emoji.discourse-cdn.com/apple/slight_smile.png?v=10 ":slight_smile:")