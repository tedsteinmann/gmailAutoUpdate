// Google Apps Script to automatically archive or delete mail with a certain label after a certain time
//
//BASED ON
/*
Original author fwed (contact@fwed.fr)
https://medium.com/@fw3d/auto-archive-emails-in-gmail-after-2-days-1ebf0e076b1c
Forked from:
https://gist.github.com/soxofaan/92fab6776c1bfcac060544ba0c9dd59c
Modifications from:
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc
https://gist.github.com/GabeBenjamin/3ef20889fa37ae97e9492e58e90db892
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc#gistcomment-1984293
*/
// GETTING STARTED
/*
Relies on GMail label convention and Google script triggers to auto archive or delete messages by interval.
For example, any email tagged with 'auto/delete/daily' will be deleted when it becomes a day old.
This is useful for daily notifications and updates.
Can be combined with filters for automatic tagging and email management.

When to use delete or archive:
- Use "delete" for re-producable message content (e.g. click here to see your online statement)
- Use "archive" for content that is only relevant for a period of time (e.g. here is your weekly news summary)
*/

//INSTALLING
/*
How to install
1. Flag desired mails with one of the labels in aotumaticGmailUpdates below (e.g. 'auto/delete/daily')
- OPTIONAL: set up flags to auto label emails
2. Create a Google Apps Script with this script
3. Set up a time driven trigger to call automaticGmailUpdates daily

## Disclaimer
Make sure you know what your are doing and use at your own risk.
I am not responsible for erroneous deletion of your emails.
*/

function automaticGmailUpdates() {
  _automaticGmailUpdates('auto/delete/daily', 1);
  _automaticGmailUpdates('auto/delete/weekly', 7);
  _automaticGmailUpdates('auto/delete/monthly', 30);

  _automaticGmailUpdates('auto/archive/daily', 1);
  _automaticGmailUpdates('auto/archive/weekly', 7);
  _automaticGmailUpdates('auto/archive/monthly', 30);
}

function _automaticGmailUpdates(labelName, minimumAgeInDays) {

  // if an instance of "auto/delete" is found in the label name, set flag to delete it.
  if (labelName.indexOf("auto/delete")>=0) {
    var update = 'delete';
  }
  //otherwise, if instance of "auto/archive" is found, set flag to archive it
  else if (labelName.indexOf("auto/archive")>=0) {
    var update = 'archive'
  }

  Logger.log('Running automatic updates for label %s (minimum age in days: %s)', labelName, minimumAgeInDays);

  // Threshold for latest message of the thread.
  var thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - minimumAgeInDays);
  Logger.log('Using threshold date %s', thresholdDate);

  // Get all the threads with the label.
  var label = GmailApp.getUserLabelByName(labelName);

  if (label) {
    Logger.log('Found label: %s', label.getName());

  var threads = label.getThreads(0, 400).filter(function(thread) {
    // Only include threads older than the limit we set in delayDays
    return (thread.getLastMessageDate() < thresholdDate);
  });

    if (threads.length == 0){
      Logger.log('Found 0 threads to update');
      return -1;
    }

  var batch_size = 100;
  while (threads.length) {
    //set the batch size to the minimum of 100 or size of threads
    var this_batch_size = Math.min(threads.length, batch_size);
    var this_batch = threads.splice(0, this_batch_size);

    if (update === 'delete') {
      Logger.log('Found %s threads to delete', this_batch.length);
      GmailApp.moveThreadsToTrash(this_batch)
    }
    else if (update === 'archive') {
      Logger.log('Found %s threads to archive', this_batch.length);
      GmailApp.moveThreadsToArchive(this_batch);
      //when archiving, we need to remove this label so that it doesn't get run again.
      label.removeFromThreads(this_batch);
    }
  }//end while
  }//end if label
}// end function
