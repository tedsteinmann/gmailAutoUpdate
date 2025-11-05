# Gmail Automatic Updates
A Google Apps Script to automatically create tasks, archive or delete mail based on a certain GMail label convention.

## Getting Started
To get started, tag emails according to the supported tagging structure in email.gs and tasks.gs as described below. Alternatively, you can customize the tags in these files.

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
- Use "delete" for re-producible message content (e.g. click here to see your online statement)
- Use "archive" for content that is only relevant for a period of time (e.g. here is your weekly news summary) but that is unique or valuable to you as email correspondence.

## Installing
1. Flag desired mails with one of the customizable labels set as global variables in email.gs and tasks.gs. Labels can be automatically added with filters if desired.
2. Create a Google Apps Script project containing the following files:

* automation.gs
* email.gs
* tasks.gs

3. Authorize tasks API and appscript:  https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services
4. Set up a time driven trigger to call processAll() in automation.gs daily

## Security Considerations

### Permissions Required
This script requires the following Gmail and Google Tasks permissions:
- Read/modify Gmail messages and labels
- Create and manage Google Tasks
- These are sensitive permissions - ensure you trust the code before authorizing

### Best Practices
- **Review Labels**: Double-check label names before enabling automation to prevent accidental deletion
- **Test First**: Test with non-critical emails before applying to important messages
- **Backup**: Consider backing up important emails before enabling automatic deletion
- **Monitor Logs**: Regularly check the script execution logs for errors or unexpected behavior
- **Label Creation**: Ensure all required labels exist before running the script to avoid errors
- **Tasklist Setup**: Verify the tasklist name matches your Google Tasks configuration

### Error Handling
The script includes comprehensive error handling to:
- Validate all inputs before processing
- Continue processing even if individual operations fail
- Log all errors for troubleshooting
- Prevent data loss from unexpected failures

### Rate Limits
- The script processes up to 400 threads per label per run
- Batch processing is implemented (100 threads per batch) to avoid quota limits
- For large volumes, consider adjusting the trigger frequency

## Disclaimer
Use at your own risk. The author is not responsible for erroneous deletion of email.
