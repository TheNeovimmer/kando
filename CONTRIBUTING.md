# Contributing to Kando

Kando is a community-driven project. We invite technical contributions that align with our core philosophy of minimalism and terminal-first efficiency.

## Standards and Conduct

We expect all contributors to maintain a professional and technical discourse. Submissions should be clear, well-reasoned, and respectful of the project's architectural constraints.

## Technical Contribution Workflow

### Error Reporting

Before opening an issue, please verify that the behavior is not already documented or addressed in existing discussions. When reporting an error, provide a comprehensive description, including environment specifications and a minimal set of reproduction steps.

### Enhancement Proposals

Proposals for new features should focus on solving specific developer friction points without introducing unnecessary complexity. Please initiate a discussion via an issue before commencing significant implementation work.

### Submission Process

1. Fork the Repository: Create a personal fork and establish a feature branch from the master branch.
2. Environment Setup: Initialize the project dependencies using `npm install`.
3. Development: Implement changes following the established coding patterns and ensuring no regressions are introduced.
4. Validation: Verify that the project builds successfully and passes all internal checks.
5. Pull Request: Provide a detailed summary of the changes and the rationale behind the implementation.

## Development Environment

```bash
# Clone the repository
git clone https://github.com/TheNeovimmer/kando.git
cd kando

# Synchronization of dependencies
npm install

# Live development execution
npm run dev

# Production build verification
npm run build
```

## Review Guidelines

All pull requests will be reviewed for code quality, adherence to the project's minimalist aesthetic, and technical correctness. We value precision and clarity over volume.

Thank you for contributing to the Kando ecosystem.
