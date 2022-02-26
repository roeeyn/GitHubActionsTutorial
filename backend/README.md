# GitHub Actions Tutorial For Backend (Python + Lambda)

## 0. Resources

We're assuming you already have an AWS account, with a user with an assigned role with Lambda access. We recommend `AWSLambda_FullAccess` policy for this tutorial, but it is not recommended for production use.

To configure your aws account locally use the [cli](https://aws.amazon.com/es/cli/):

```shell
aws configure
```

### 0.1 Create the Lambda

We need to create the lambda, which is a serverless function. We won't be able to execute it from outside yet, for we can run tests inside the AWS platform.

[Here](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html) is a great guide on how to do this.

### 0.2 Test the Lambda From Outside

For this, you need to create a HTTP API with a lambda integration.

[Here](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop.html#apigateway-http-api-create.console) is a great guide on how to do this.

### 0.3 Upload Local Code to Lambda

To test that our lambda is working correctly, we can upload manually the project to our recently created lambda.

To do this, we can follow the next steps:

1. Zip the project:

```shell
# This will generate a build/ folder
mkdir build/

# This will generate lambda_code.zip
zip -r build/lambda_code.zip . -x .git -x .pytest_cache/* -x __pycache__
```

2. Upload the contents of the `build` folder into your lambda.

```shell
# Replace your lambda name
aws lambda update-function-code --function-name YOUR_LAMBDA --zip-file fileb://build/lambda_code.zip

# This is the command for me
aws lambda update-function-code --function-name github-actions-backend-tutorial --zip-file fileb://build/lambda_code.zip --region us-east-2
```

At this point the lambda should already contain the files of the zip. In my case it should be already [here](https://du717vx7qb.execute-api.us-east-2.amazonaws.com/github-actions-backend-tutorial).

Remember it has to be the Gateway API url.

## 1. Create the GitHub Actions Workflows

The final workflow file for backend is [this](../.github/workflows/backend.yml).

### 1.1 Definition of the Workflow

The first step to define the workflow is to define the name with the `name` reserved keyword.

After that we need to define the `on` keyword, which indicates when this workflow is going to be triggered.

In this case, we will only trigger the workflow when the `main` branch receives a new commit (directly push or merged pull request).

```yaml
# This is the name of the workflow
name: Backend Workflow

# Definition of the events that triggers the workflow
on:
  push:
    # We will only run this on a push in
    #   the main branch
    branches: [main]
    paths:
      - backend/**
```

### 1.2 Definition of the Jobs

We will have four jobs in our workflow:

- Formatting
- Test
- Deploy

#### 1.2.1 Formatting Job

This job is the first one to run and is used to verify that the code is correctly formatted. To verify this we're using [black](https://black.readthedocs.io/en/stable/getting_started.html), one of the most popular tools for python.

```yaml
    ...
   webinar-formatting: # Name of the job
    runs-on: ubuntu-latest # Where the job is going to be executed
    steps:
    - uses: actions/checkout@v2 # Checkout code in new environment
    - uses: psf/black@stable # Check if the code is formatted correctly.

    ...
```

#### 1.2.2 Test Job

The test job is going to be run in parallel with the previous job, which means it will be taking less time to complete.

This job is a special job as it contains a special feature named `matrix`. This feature let us create multiple sub-jobs based on certain parameters, in this case, the os type and python version. The matrix contains two variables with two and three values respectively, which means we will have six (all combinations of both variables) different test scenarios.

```yaml
---
webinar-test: # Name of the job
  runs-on: ubuntu-latest # Where the job is going to be executed
  strategy:
    matrix:
      # Define variable 'os'
      os: [ubuntu-latest, windows-2016]
      # Define variable 'python-version'
      python-version: ['pypy-3.7', 'pypy-3.8', '3.x']
  steps:
    - uses: actions/checkout@v2 # Checkout the code in new environment
    - name: Usando Python ${{ matrix.python-version }} # Name of the job depending on the 'python-version' variable
        uses: actions/setup-python@v2
        with:
            # Configure python depending on the 'python-version' variable
            python-version: ${{ matrix.python-version }}
    # Install dependencies
    - run: pip install -r requirements.txt
    # Run unit tests
    - run: pytest
...
```

#### 1.2.3 Deploy Job

Once we ran the tests, we want to upload the code to the lambda. For this, we're going to use a community GitHub Action to upload the code to the lambda.

```yaml
webinar-deploy:
    needs: [webinar-testing, webinar-formatting]
    environment:
      name: production
      url: https://du717vx7qb.execute-api.us-east-2.amazonaws.com/github-actions-backend-tutorial
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - uses: appleboy/lambda-action@master
      with:
        aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws_region: us-east-2
        function_name: github-actions-backend-tutorial
        source: backend/
```

# Developing the Project

This code is the basic code from the lambda example.

## Install dependencies

```shell
pip install -r requirements.txt
```

## Run tests

```shell
pytest
```
