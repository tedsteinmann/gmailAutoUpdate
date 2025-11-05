/**
 * Main automation entry point
 * Processes both email management and task creation
 * Should be triggered daily via time-driven trigger
 */
function processAll() {
  try {
    Logger.log('=== PROCESSING EMAIL ===');
    processEmails();
  } catch (e) {
    Logger.log('ERROR: Email processing failed: %s', e.message);
    // Continue to process tasks even if email processing fails
  }

  try {
    Logger.log('=== PROCESSING TASKS ===');
    processTasks();
  } catch (e) {
    Logger.log('ERROR: Task processing failed: %s', e.message);
  }

  Logger.log('=== PROCESSING COMPLETE ===');
}
