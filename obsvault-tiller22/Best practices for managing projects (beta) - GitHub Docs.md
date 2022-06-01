---
page-title: "Best practices for managing projects (beta) - GitHub Docs"
url: https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects
date: "2022-06-01 08:16:53"
---
**Note:** Projects (beta) is currently in public beta and subject to change.

You can use projects to manage your work on GitHub, where your issues and pull requests live. Read on for tips to manage your projects efficiently and effectively. For more information about projects, see "[About projects](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/about-projects)."

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#break-down-large-issues-into-smaller-issues)Break down large issues into smaller issues

Breaking a large issue into smaller issues makes the work more manageable and enables team members to work in parallel. It also leads to smaller pull requests, which are easier to review.

To track how smaller issues fit into the larger goal, use task lists, milestones, or labels. For more information, see "[About task lists](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-issues/about-task-lists)", "[About milestones](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones)", and "[Managing labels](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)."

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#communicate)Communicate

Issues and pull requests include built-in features to let you easily communicate with your collaborators. Use @mentions to alert a person or entire team about a comment. Assign collaborators to issues to communicate responsibility. Link to related issues or pull requests to communicate how they are connected.

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#make-use-of-the-description-and-readme)Make use of the description and README

Use your project's description and README to share information about the project.

For example:

-   Explaining the purpose of the project.
-   Describing the project views and how to use them.
-   Including relevant links and people to contact for more information.

Project READMEs support Markdown which allows you to use images and advanced formatting such as links, lists, and headers.

For more information, see "[Creating a project (beta)](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/creating-a-project#updating-your-project-description-and-readme)."

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#use-views)Use views

Use project views to look at your project from different angles.

For example:

-   Filter by status to view all un-started items
-   Group by a custom priority field to monitor the volume of high priority items
-   Sort by a custom date field to view the items with the earliest target ship date

For more information, see "[Customizing your project views](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/customizing-your-project-views)."

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#have-a-single-source-of-truth)Have a single source of truth

To prevent information from getting out of sync, maintain a single source of truth. For example, track a target ship date in a single location instead of spread across multiple fields. Then, if the target ship date shifts, you only need to update the date in one location.

GitHub projects automatically stay up to date with GitHub data, such as assignees, milestones, and labels. When one of these fields changes in an issue or pull request, the change is automatically reflected in your project.

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#use-automation)Use automation

You can automate tasks to spend less time on busy work and more time on the project itself. The less you need to remember to do manually, the more likely your project will stay up to date.

Projects (beta) offers built-in workflows. For example, when an issue is closed, you can automatically set the status to "Done."

Additionally, GitHub Actions and the GraphQL API enable you to automate routine project management tasks. For example, to keep track of pull requests awaiting review, you can create a workflow that adds a pull request to a project and sets the status to "needs review"; this process can be automatically triggered when a pull request is marked as "ready for review."

-   For an example workflow, see "[Automating projects](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/automating-projects)."
-   For more information about the API, see "[Using the API to manage projects](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/using-the-api-to-manage-projects)."
-   For more information about GitHub Actions, see ["GitHub Actions](https://docs.github.com/en/actions)."

## [](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/best-practices-for-managing-projects#use-different-field-types)Use different field types

Take advantage of the various field types to meet your needs.

Use an iteration field to schedule work or create a timeline. You can group by iteration to see if items are balanced between iterations, or you can filter to focus on a single iteration. Iteration fields also let you view work that you completed in past iterations, which can help with velocity planning and reflecting on your team's accomplishments. Iteration fields also support breaks to show when you and your team are taking time away from their iterations. For more information, see "[Managing iterations in projects](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/managing-iterations)."

Use a single select field to track information about a task based on a preset list of values. For example, track priority or project phase. Since the values are selected from a preset list, you can easily group or filter to focus on items with a specific value.

For more information about the different field types, see "[Creating a project (beta)](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/creating-a-project#adding-custom-fields)."