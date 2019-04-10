# Gmail Automatic Updates
A Google Apps Script to automatically create tasks, archive or delete mail based on a certain GMail label convention.

Getting Started
---------------
To get started, tag emails according to the suppoted tagging structure in email.gs and tasks.gs as described below. Alternatively, you can customize the tags in these files.

## Tasks
Any email labeled "@Task" will create a task due tomorrow. Emails that have had tasks created will then be re-labeled "Tasked".

## Email
Email management relies on a nested set of labels. For example, any email tagged with 'auto/delete/daily' will be automatically deleted when it becomes a day old.
This is useful for daily notifications and updates.
Can be combined with filters for automatic tagging and email management.

Supported Tags:
* auto/delete/daily
* auto/delete/weekly
* auto/delete/monthly
* auto/archive/daily
* auto/archive/weekly
* auto/archive/monthly

When to use delete or archive:
- Use "delete" for re-producable message content (e.g. click here to see your online statement)
- Use "archive" for content that is only relevant for a period of time (e.g. here is your weekly news summary) but that is unique or valuable to you as email correspondence.

Installing
----------
1. Flag desired mails with one of the customizable labels set as global variables in email.gs and tasks.gs. Labels can be automatically added with filters if desired.
2. Create a Google Apps Script project containing the following files:

* automation.gs
* email.gs
* tasks.gs

3. Set up a time driven trigger to call processAll() in automation.gs daily

Disclaimer
----------
Use at your own risk. The author is not responsible for erroneous deletion of email.
