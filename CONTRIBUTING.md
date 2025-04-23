# Contributing to UAT Web App project

## How to Contribute

- Fork the repository
- Create a new branch (`git checkout -b feature-branch`)
- Make your changes
- Commit your changes (`git commit -m 'Add new feature'`)
- Push to the branch (`git push origin feature-branch`)
- Open a pull request

## Reporting Issues

- Use the issue tracker to report bugs or request features.
- Provide as much detail as possible.

## Coding Standards

- Follow the existing code style.
- Write tests for new features and bug fixes.

## Release Process

- Ensure all changes intended for the release are merged into the `main` branch.
- Perform any necessary manual testing and validation. You might want to lock the branch to prevent changes while this
  occurs.
- Once the `main` branch is ready, create a new tag to mark the release. Tags should follow the Semantic Versioning
  format (e.g., `v1.0.0`).
- After tagging, the release process can be initiated. This may involve deploying the code (hopefully we can automate
  most of it), creating release notes, and notifying stakeholders (if desired).