---
title: "Contribution"
description: "Payload CMS auth plugin contribution guidelines"
seo:
  title: "Contribution"
  description: "Payload CMS auth plugin contribution guidelines"
---

# Contribution Guide

Thank you for your interest in contributing to our project! We appreciate your time and effort in helping us improve. Please follow the guidelines below to ensure a smooth contribution process.

<br/>
<br/>

## Reporting Issues

Before reporting a new issue, please:

<br/>
<br/>

1. **Check Existing Issues**: First, check if a similar issue already exists (open or closed). This helps avoid duplicates and speeds up the resolution process.

2. **Be Descriptive**: Provide a detailed description of the issue. Include the following information:

- Steps to reproduce the issue.
- Expected and actual behavior.
- Any relevant logs or screenshots.
- Environment details (e.g., OS, browser, version of the software).

If your issue is a **feature request**, please include:


- The purpose of the feature.
<br/>
- The benefits of the feature.
- The motivation behind the feature request.

<br/>
<br/>

## Submitting Pull Requests

When submitting a pull request (PR), please follow these guidelines:

1. **Fork the Repository**: Create a fork of the repository on GitHub.
<br/>

2. **Create a New Branch**: Create a new branch from `main` for your work. Use a descriptive name, such as `feat/adding-new-providers`.

3. **Commit Messages**: Use the following commit message conventions:

- `feat: adds new feature`

- `fix: fixes bug`

- `docs: adds documentation`

- `chore: does chore`

<br/>

### 1. Commit Message Format

At the top level, we use the following types to categorize our commits:

`feat`: New feature that adds functionality. These are automatically added to the changelog when creating new releases.

`fix`: A fix to an existing feature. These are automatically added to the changelog when creating new releases.

`docs`: Changes to documentation only. These do not appear in the changelog.

`chore`: Changes to code that are neither a fix nor a feature (e.g., refactoring, adding tests, etc.). These do not appear in the changelog.

<br/>

### 2. Creating the Pull Request

When creating a PR, please ensure:

1. **Proper Naming**: Use a descriptive title for the PR, matching the branch name if possible.

2. **Detailed Description**: Provide a detailed description of the changes. Include:

- The purpose of the changes.

- The problem being solved or the feature being added.

- Any relevant issue numbers (e.g., `Closes #123`).

- Instructions on how to test the changes.

3. **Review Process**: Be prepared to engage in the review process. Respond to feedback and make necessary changes.

<br/>
<br/>

## Running the Plugin

1. **Clone the Forked Plugin Repository**

Clone the repository you forked from the original project.


2. **Install Packages**

Run `bun install` to install all necessary dependencies.

3. **Build and Test the Plugin Locally**

- Run the build command `bun build` in the root directory. This will generate a `/dist` directory.
- Create a PayloadCMS project.
- Import the `/dist` directory accordingly
- Run the project using `pnpm dev`.

4. **Building the Plugin**

Building the plugin is necessary to view any changes locally. This ensures that the output generated locally will be the same as the one generated after publishing the plugin.

We appreciate your contributions and look forward to collaborating with you! If you have any questions or need assistance, please don't hesitate to reach out. Cheers!
