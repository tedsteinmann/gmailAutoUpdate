function gmailAutoDeleteAfter1Week() {
  _gmailAutoDelete('todelete/after1week', 7);
}

function gmailAutoDeleteAfter1Month() {
  _gmailAutoDelete('todelete/after1month', 30);
}

function gmailAutoDeleteAfter3Months() {
  _gmailAutoDelete('todelete/after3months', 90);
}

// Delete Threads with given label, older than given number of days
//
// Based on:
// https://medium.com/@fw3d/auto-archive-emails-in-gmail-after-2-days-1ebf0e076b1c
// https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc
// https://gist.github.com/GabeBenjamin/3ef20889fa37ae97e9492e58e90db892
function _gmailAutoDelete(labelName, minimumAgeInDays) {
  Logger.log('Running autodelete for label %s (minimum age in days: %s)', labelName, minimumAgeInDays);
  
  // Threshold for latest message of the thread.
  var thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - minimumAgeInDays);
  Logger.log('Using threshold date %s', thresholdDate);

  // Get all the threads with the label.
  var label = GmailApp.getUserLabelByName(labelName);
  Logger.log('Found label %s', label);
  if (label) {
    Logger.log('Found label: %s', label.getName());
    var batchSize = 100;
    var start = 0;
    while (true) {
      Logger.log('Batch %s %s', start, batchSize);
      var threads = label.getThreads(start, batchSize);
      if (threads.length < 1) {
        Logger.log('No more threads');
        break;
      }
      var toDelete = threads.filter(function(thread) {
        return (thread.getLastMessageDate() < thresholdDate);
      })
      Logger.log('Found %s threads to delete', toDelete.length);
      GmailApp.moveThreadsToTrash(toDelete)
      // Prepare for next batch
      start += batchSize - toDelete.length; 
    }
  }
}

