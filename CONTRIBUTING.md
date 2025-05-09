# Contributing to UAT Web App project

## How to Contribute

- Fork the repository.
- Create a new branch (`git checkout -b feature-branch`).
- Make your changes.
- Commit your changes (`git commit -m 'Add new feature'`).
- Push to the branch (`git push origin feature-branch`).
- Open a pull request.

## Reporting Issues

- Use the issue tracker to report bugs or request features.
- Provide as much detail as possible.

## Coding Standards

- Follow the existing code style.
- For Python, adhere to the PEP 8 style guide.
- For JavaScript, use ESLint with the project's configuration.
- Write tests for new features and bug fixes.

## Accessibility

- Ensure that all changes meet accessibility guidelines, including support for users with disabilities such as visual impairments.
- Verify that the application can be fully navigated and used with a keyboard only (no mouse).
- Test for compatibility with screen readers and other assistive technologies.
- Follow the Web Content Accessibility Guidelines (WCAG) 2.1 standards where applicable.

## Release Process

1. Ensure all changes intended for the release are merged into the `main` branch.
2. Perform any necessary manual testing and validation. Lock the branch to prevent changes during this process if needed.
3. Create a new tag to mark the release. Tags should follow the Semantic Versioning format (e.g., `v1.0.0`).
4. Initiate the release process, which may involve deploying the code, creating release notes, and notifying stakeholders.