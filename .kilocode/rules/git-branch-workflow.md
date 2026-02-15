## Brief overview
Project-specific rule for git branch management when starting new features or tasks.

## Git branch workflow
- When the user starts a new feature or task, **always ask** whether they want to create a new git branch for it before beginning any work.
- Suggest a branch name based on the feature/task description (e.g., `feature/add-search-filters`, `fix/download-progress-bar`).
- If the user confirms, create the branch from the current branch before proceeding with implementation.
- If the user declines, proceed with work on the current branch without further prompting.
