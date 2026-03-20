const Project = require('./models/project');

async function syncProject() {
  try {
    await Project.sync({ force: true });
    console.log('Project table synced successfully with latest schema.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing individual model:', error);
    process.exit(1);
  }
}

syncProject();
