/**
 * Script to create tasks from Gmail label
 * Based on: https://qmacro.org/2011/10/04/automated-email-to-task-mechanism-with-google-apps-script/
 * Author: tedsteinmann
 */

// Setting primary inputs - Configuration constants
const TASKLIST = 'Personal';
const LABEL_PENDING = '@Task';
const LABEL_DONE = 'Tasked';

/**
 * Primary function to process the pending task emails
 */
function processTasks() {
  try {
    processPending_();
  } catch (e) {
    Logger.log('ERROR: Failed to process tasks: %s', e.message);
  }
}

/**
 * Testing and debugging functions
 */
function listTasksByName() {
  const tasklistId = getTasklistId_(TASKLIST);
  if (tasklistId) {
    listTasks_(tasklistId);
  } else {
    Logger.log('ERROR: Tasklist "%s" not found', TASKLIST);
  }
}


function addTestTask() {
  const tasklistId = getTasklistId_(TASKLIST);
  if (tasklistId) {
    addTask_('test', 'Test task note', tasklistId);
  } else {
    Logger.log('ERROR: Tasklist "%s" not found', TASKLIST);
  }
}

/**
 * Private functions
 */

/**
 * Get tasklist ID by name
 * @param {string} tasklistName - The name of the tasklist
 * @return {string|null} The tasklist ID or null if not found
 */
function getTasklistId_(tasklistName) {
  // Input validation
  if (!tasklistName || typeof tasklistName !== 'string') {
    Logger.log('ERROR: Invalid tasklist name');
    return null;
  }

  try {
    const tasklistsList = Tasks.Tasklists.list();
    if (!tasklistsList) {
      Logger.log('ERROR: Failed to retrieve tasklists');
      return null;
    }

    const taskLists = tasklistsList.getItems();
    if (!taskLists || taskLists.length === 0) {
      Logger.log('WARNING: No tasklists found');
      return null;
    }

    for (const taskList of taskLists) {
      if (taskList && taskList.getTitle() === tasklistName) {
        return taskList.getId();
      }
    }
    
    Logger.log('WARNING: Tasklist "%s" not found', tasklistName);
    return null;
  } catch (e) {
    Logger.log('ERROR: Failed to get tasklist ID: %s', e.message);
    return null;
  }
}

/**
 * List all tasks in a tasklist
 * @param {string} taskListId - The tasklist ID
 */
function listTasks_(taskListId) {
  // Input validation
  if (!taskListId || typeof taskListId !== 'string') {
    Logger.log('ERROR: Invalid tasklist ID');
    return;
  }

  try {
    const tasks = Tasks.Tasks.list(taskListId);
    if (tasks && tasks.items && tasks.items.length > 0) {
      for (let i = 0; i < tasks.items.length; i++) {
        const task = tasks.items[i];
        if (task) {
          Logger.log('Task with title "%s" and ID "%s" was found.',
                     task.title, task.id);
        }
      }
    } else {
      Logger.log('No tasks found.');
    }
  } catch (e) {
    Logger.log('ERROR: Failed to list tasks: %s', e.message);
  }
}

/**
 * Adds a task to a tasklist with due date set to tomorrow
 * @param {string} title - The task title
 * @param {string} taskNote - The task notes/description
 * @param {string} taskListId - The tasklist ID to add to
 */
function addTask_(title, taskNote, taskListId) {
  // Input validation
  if (!title || typeof title !== 'string') {
    Logger.log('ERROR: Invalid task title');
    return;
  }

  if (!taskListId || typeof taskListId !== 'string') {
    Logger.log('ERROR: Invalid tasklist ID');
    return;
  }

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = Utilities.formatDate(tomorrow, "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const task = {
      title: title,
      notes: taskNote || '',
      due: dueDate
    };
    
    const createdTask = Tasks.Tasks.insert(task, taskListId);
    Logger.log('Task created: %s', createdTask.title);
  } catch (e) {
    Logger.log('ERROR: Failed to create task: %s', e.message);
  }
}


/**
 * Process pending task emails - creates tasks from labeled emails
 * Iterates through emails with LABEL_PENDING, creates tasks, and relabels them
 */
function processPending_() {

  const label_pending = GmailApp.getUserLabelByName(LABEL_PENDING);
  const label_done = GmailApp.getUserLabelByName(LABEL_DONE);

  // Validate labels exist
  if (!label_pending) {
    Logger.log('ERROR: Pending label "%s" not found. Please create the label first.', LABEL_PENDING);
    return;
  }

  if (!label_done) {
    Logger.log('ERROR: Done label "%s" not found. Please create the label first.', LABEL_DONE);
    return;
  }

  // Get tasklist ID
  const taskListId = getTasklistId_(TASKLIST);
  if (!taskListId) {
    Logger.log('ERROR: Tasklist "%s" not found. Cannot create tasks.', TASKLIST);
    return;
  }

  // The threads currently assigned to the 'pending' label
  let threads;
  try {
    threads = label_pending.getThreads();
  } catch (e) {
    Logger.log('ERROR: Failed to get threads: %s', e.message);
    return;
  }

  if (!threads || threads.length === 0) {
    Logger.log('No pending tasks to process');
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  // Process each thread, assuming there's only a single message in each thread
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    if (!thread) {
      Logger.log('WARNING: Null thread at index %s', i);
      continue;
    }

    try {
      // Grab the task data
      const taskTitle = thread.getFirstMessageSubject();
      const taskNote = 'Email: ' + thread.getPermalink();

      // Validate task title
      if (!taskTitle || taskTitle.trim().length === 0) {
        Logger.log('WARNING: Skipping thread with empty subject');
        continue;
      }

      // Insert the task
      addTask_(taskTitle, taskNote, taskListId);

      // Set to 'done' by exchanging labels
      thread.removeLabel(label_pending);
      thread.addLabel(label_done);
      
      successCount++;
    } catch (e) {
      Logger.log('ERROR: Failed to process thread: %s', e.message);
      failureCount++;
    }
  }

  // Log summary
  Logger.log('Processed %s tasks successfully, %s failures', successCount, failureCount);
}
