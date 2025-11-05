/*
Original author
fwed (contact@fwed.fr)
https://medium.com/@fw3d/auto-archive-emails-in-gmail-after-2-days-1ebf0e076b1c

### Modifications from:
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc
https://gist.github.com/GabeBenjamin/3ef20889fa37ae97e9492e58e90db892
https://gist.github.com/soxofaan/92fab6776c1bfcac060544ba0c9dd59c
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc#gistcomment-1984293
*/

/**
 * Main function to process emails based on auto labels
 * Iterates through configured actions and intervals to archive/delete old emails
 */
function processEmails() {

  // Setting primary inputs
  const prefix = 'auto'; // Top level label (case sensitive)
  const actions = ['delete','archive']; // Supported actions - DO NOT CHANGE
  const interval = [ // Configurable intervals and days
    { name: 'daily', days: 1,},
    { name: 'weekly', days: 7,},
    { name: 'monthly', days: 30,},
  ];

  // Input validation
  if (!prefix || typeof prefix !== 'string') {
    Logger.log('ERROR: Invalid prefix configuration');
    return;
  }

  // e.g. Gmail label structure: auto/delete/daily OR auto/archive/weekly

  actions.forEach(setInterval);

  function setInterval(value) {
    // Input validation
    if (!value || typeof value !== 'string') {
      Logger.log('ERROR: Invalid action value: %s', value);
      return;
    }

    const action = value; // For clarity

    for (let i = 0; i < interval.length; i++) { // Looping over intervals
      // Validate interval configuration
      if (!interval[i] || !interval[i].name || typeof interval[i].days !== 'number') {
        Logger.log('ERROR: Invalid interval configuration at index %s', i);
        continue;
      }
      const labelName = prefix + '/' + value + '/' + interval[i].name;
      _automaticGmailUpdates(labelName, interval[i].days, action);
    }
  }
}

/**
 * Automatically archives or deletes Gmail threads based on label and age
 * @param {string} labelName - The Gmail label to process
 * @param {number} days - Number of days threshold for processing
 * @param {string} action - Action to perform: 'delete' or 'archive'
 */
function _automaticGmailUpdates(labelName, days, action) {

  // Input validation
  if (!labelName || typeof labelName !== 'string') {
    Logger.log('ERROR: Invalid label name provided');
    return;
  }

  if (typeof days !== 'number' || days < 0) {
    Logger.log('ERROR: Invalid days value: %s', days);
    return;
  }

  if (action !== 'delete' && action !== 'archive') {
    Logger.log('ERROR: Invalid action: %s. Must be "delete" or "archive"', action);
    return;
  }

  Logger.log('Running automatic ' + action + ' for messages labeled %s', labelName);

  // Threshold for latest message of the thread
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - days);
  Logger.log('Using threshold date %s', thresholdDate);

  // Get the label by name
  const label = GmailApp.getUserLabelByName(labelName);

  if (!label) {
    Logger.log('WARNING: Label not found: %s', labelName);
    return;
  }

  // Get all the threads with the label (max 400 per batch)
  let threads;
  try {
    threads = label.getThreads(0, 400).filter(function(thread) {
      // Only include threads older than the limit we set in days
      return thread && thread.getLastMessageDate() < thresholdDate;
    });
  } catch (e) {
    Logger.log('ERROR: Failed to get threads for label %s: %s', labelName, e.message);
    return;
  }

  if (!threads || threads.length === 0) {
    Logger.log('Found 0 threads to update');
    return;
  }

  const batch_size = 100;
  while (threads.length > 0) {
    // Set the batch size to the minimum of 100 or size of threads
    const this_batch_size = Math.min(threads.length, batch_size);
    const this_batch = threads.splice(0, this_batch_size);

    Logger.log('Found %s threads to ' + action, this_batch.length);

    try {
      if (action === 'delete') {
        GmailApp.moveThreadsToTrash(this_batch);
      } else if (action === 'archive') {
        GmailApp.moveThreadsToArchive(this_batch);
        // When archiving, remove the label so it doesn't get processed again
        label.removeFromThreads(this_batch);
      }
    } catch (e) {
      Logger.log('ERROR: Failed to process batch of %s threads: %s', this_batch.length, e.message);
      // Continue processing remaining threads even if one batch fails
    }
  } // end while
} // end function
