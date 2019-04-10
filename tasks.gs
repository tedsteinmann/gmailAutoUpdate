/**
 * script to create tasks from Gmail label
 * based on: https://qmacro.org/2011/10/04/automated-email-to-task-mechanism-with-google-apps-script/
 * author: tedsteinmann
 */

//setting primary inputs
var TASKLIST = 'Personal';
var LABEL_PENDING = '@Task';
var LABEL_DONE = 'Tasked';

// Primary function to process the pending task emails
function processTasks() {

  processPending_();
}

/**
 * Testing and debugging functions
 */
function listTasksByName() {
  listTasks_(getTasklistId_(TASKLIST))
}


function addTestTask() {
 addTask_('test',getTasklistId_(TASKLIST))
}

/**
 * private functions
 */

function getTasklistId_(tasklistName) {
  var tasklistsList = Tasks.Tasklists.list();
  var taskLists = tasklistsList.getItems();
  for (tl in taskLists) {
    var title = taskLists[tl].getTitle();
    if (title == tasklistName) {
      return taskLists[tl].getId();
    }
  }
}

function listTasks_(taskListId) {
  var tasks = Tasks.Tasks.list(taskListId);
  if (tasks.items) {
    for (var i = 0; i < tasks.items.length; i++) {
      var task = tasks.items[i];
      Logger.log('Task with title "%s" and ID "%s" was found.',
                 task.title, task.id);
    }
  } else {
    Logger.log('No tasks found.');
  }
}

/**
 * Adds a task to a tasklist with due date set to tomorrow.
 * @param {string} taskListId The tasklist to add to.
 */
function addTask_(title,taskNote, taskListId) {

  var tomorrow = new Date();
  var dueDate = Utilities.formatDate(tomorrow, "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'")

  var task = {
    title: title,
    notes: taskNote,
    due: dueDate
  };
  task = Tasks.Tasks.insert(task, taskListId);
  Logger.log('Task created: %s', task.title);
}


function processPending_() {

  var label_pending = GmailApp.getUserLabelByName(LABEL_PENDING);
  var label_done = GmailApp.getUserLabelByName(LABEL_DONE);

  // The threads currently assigned to the 'pending' label
  var threads = label_pending.getThreads();

  // Process each one in turn, assuming there's only a single
  // message in each thread
  for (var t in threads) {
    var thread = threads[t];

    // Grab the task data
    var taskTitle = thread.getFirstMessageSubject();
    var taskNote = 'Email: ' + thread.getPermalink();

    // Insert the task
    addTask_(taskTitle, taskNote, getTasklistId_(TASKLIST));

    // Set to 'done' by exchanging labels
    thread.removeLabel(label_pending);
    thread.addLabel(label_done);
  }

  // Increment the processed tasks count
  Logger.log('Processed %s tasks', threads.length);
}
