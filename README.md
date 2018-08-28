# Gmail Automatic Updates
A Google Apps Script to automatically archive or delete mail with a certain label after a certain time.

### Original author
fwed (contact@fwed.fr)
https://medium.com/@fw3d/auto-archive-emails-in-gmail-after-2-days-1ebf0e076b1c

### Modifications from:
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc
https://gist.github.com/GabeBenjamin/3ef20889fa37ae97e9492e58e90db892
https://gist.github.com/soxofaan/92fab6776c1bfcac060544ba0c9dd59c
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc#gistcomment-1984293

Getting Started
---------------
Relies on GMail label convention and Google script triggers to auto archive or delete messages by interval.
For example, any email tagged with 'auto/delete/daily' will be deleted when it becomes a day old.
This is useful for daily notifications and updates.
Can be combined with filters for automatic tagging and email management.

When to use delete or archive:
- Use "delete" for re-producable message content (e.g. click here to see your online statement)
- Use "archive" for content that is only relevant for a period of time (e.g. here is your weekly news summary)

Installing
----------
1. Flag desired mails with one of the labels in automaticGmailUpdates (e.g. 'auto/delete/daily')
- OPTIONAL: set up filters to auto label emails
2. Create a Google Apps Script with this gmailAutomaticUpdates.gs
3. Set up a time driven trigger to call automaticGmailUpdates daily

Disclaimer
----------
Use at your own risk. The author is not responsible for erroneous deletion of email.
