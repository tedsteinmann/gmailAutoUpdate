/*
Athor: @tedsteinmann
Copyright: https://gist.github.com/tedsteinmann/0ee248856de6e75498470db7c98fab09

Original author
fwed (contact@fwed.fr)
https://medium.com/@fw3d/auto-archive-emails-in-gmail-after-2-days-1ebf0e076b1c

### Modifications from:
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc
https://gist.github.com/GabeBenjamin/3ef20889fa37ae97e9492e58e90db892
https://gist.github.com/soxofaan/92fab6776c1bfcac060544ba0c9dd59c
https://gist.github.com/anonymous/2cca33d376f7f924fdaa67891ad098cc#gistcomment-1984293
*/

function automaticGmailUpdates() {

//setting primary inputs
var prefix = 'auto'; //top level label could be re-named (it is case sensitive);
var actions = ['delete','archive']; //conditional -- DO NOT CHANGE
var interval = [ // could change intervals and days (un-tested)
  { name: 'daily', days: 1,},
  { name: 'weekly',days: 7,},
  { name: 'monthly',days: 30,},
];

//e.g. Gmail label structure: auto/delete/daily OR auto/archive/weekly

actions.forEach(setInterval);

  function setInterval(value) {

    var action = value; //for clarity

  	for (i=0; i < interval.length ; i++) { //looping over intervals
      var label = prefix +'/'+ value +'/'+ interval[i].name;
        _automaticGmailUpdates(label, interval[i].days, action);
  	}
  }
}

function _automaticGmailUpdates(label, days, action) {

  Logger.log('Running automatic ' + action +' for messages labeled %s', label);

  // Threshold for latest message of the thread.
  var thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - days);
  Logger.log('Using threshold date %s', thresholdDate);

  // Get all the threads with the label.
  var label = GmailApp.getUserLabelByName(label);

  if (label) {
    //Logger.log('Found label: %s', label.getName());

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

    Logger.log('Found %s threads to ' + action, this_batch.length);

    if (action === 'delete') {
      GmailApp.moveThreadsToTrash(this_batch)
    }
    else if (action === 'archive') {
      GmailApp.moveThreadsToArchive(this_batch);
      label.removeFromThreads(this_batch);//when archiving, we need to remove this label so that it doesn't get run again.
    }
  }//end while
  }//end if label
}// end function
