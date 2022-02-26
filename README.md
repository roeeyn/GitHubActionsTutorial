![S3 frontend workflow](https://github.com/roeeyn/GitHubActionsTutorial/actions/workflows/frontend.yml/badge.svg)
![Lambda backend workflow](https://github.com/roeeyn/GitHubActionsTutorial/actions/workflows/backend.yml/badge.svg)

# GitHub Actions Tutorial

This is a brief intro of how to use GitHub Actions for a frontend (static S3) and a backend (lambda).

If you want to learn more about GitHub Actions, you can take a look to the [GitHub Actions labs](https://lab.github.com/) which have more examples and tutorials.

## Frontend (S3)

If you want to see the frontend tutorial, go to the [frontend](frontend/) folder.

## Backend (AWS Lambda)

If you want to see the backend tutorial, go to the [backend](backend/) folder.

## Misc Workflows

We have another workflows triggered by issues and pull requests, you can see them [here](.github/workflows/)

## Pre-commit

As we mentioned during our live course, we may check if our work is correct before pushing the changes to GitHub. For this, we're using the [pre-commit](https://pre-commit.com/) tool that will create git hooks and run checks whenever you try to commit new changes.
