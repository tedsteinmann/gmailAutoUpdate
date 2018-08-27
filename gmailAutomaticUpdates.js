function automaticGmailUpdates() {
  _automaticGmailUpdates('auto/delete/daily', 1);
  _automaticGmailUpdates('auto/delete/weekly', 7);
  _automaticGmailUpdates('auto/delete/monthly', 30);

  _automaticGmailUpdates('auto/archive/daily', 1);
  _automaticGmailUpdates('auto/archive/weekly', 7);
  _automaticGmailUpdates('auto/archive/monthly', 30);
}

// Delete Threads with given label, older than given number of days
//
// Based on:
// https://medium.com/@fw3d/auto-archive-emails-in-gmail-after-2-days-1ebf0e076b1c
// https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc
// https://gist.github.com/GabeBenjamin/3ef20889fa37ae97e9492e58e90db892
function _automaticGmailUpdates(labelName, minimumAgeInDays) {
  Logger.log('Running automatic updates for label %s (minimum age in days: %s)', labelName, minimumAgeInDays);

  // Threshold for latest message of the thread.
  var thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - minimumAgeInDays);
  Logger.log('Using threshold date %s', thresholdDate);

  // Get all the threads with the label.
  var label = GmailApp.getUserLabelByName(labelName);

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
        var toUpdate = threads.filter(function(thread) {
          return (thread.getLastMessageDate() < thresholdDate);
        })

        //if an instance of "auto/delete" is found in the label name, delete it.
        if (labelName.indexOf("auto/delete")>=0) {
          Logger.log('Found %s threads to delete', toUpdate.length);
          GmailApp.moveThreadsToTrash(toUpdate)
        }
        //otherwise, if instance of "auto/archive" is found archive it
        else if (labelName.indexOf("auto/archive")>=0) {
          Logger.log('Found %s threads to archive', toUpdate.length);
           GmailApp.moveThreadsToArchive(toUpdate);
        }

      // Prepare for next batch
      start += batchSize - toUpdate.length;
    }
  }
}
