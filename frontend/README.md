# GitHub Actions Tutorial For Frontend (React + S3)

## 0. Resources

We're assuming you already have an AWS account, with a user with an assigned role with S3 access. We recommend `AmazonS3FullAccess` policy for this tutorial, but it is not recommended for production use.

To configure your aws account locally use the [cli](https://aws.amazon.com/es/cli/):

```shell
aws configure
```

### 0.1 Create the bucket

We need to create the bucket because we will use it as our static web server. It is not recommended to use it as a production web server though, because it doesn't have flexible SSL configurations, but for learning purposes is great.

[Here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html) is a great guide on how to do this.

### 0.2 Test the Website Manually

To test that our website is working correctly, we can upload manually the project to our recently created S3 bucket.

To do this, we can follow the next steps:
1. Build the project to generate the static files:

```shell
# This will generate a build/ folder
npm run build
```

2. Upload the contents of the `build` folder into your S3 bucket

```shell
# Change this to your bucket name
aws s3 cp build/ s3://YOUR_BUCKET --recursive

# In my case, the command is this
aws s3 cp build/ s3://github-actions-frontend-tutorial --recursive
```

At this point the webserver should already contain the files of the `build/` folder. In my case it should be already [here](http://github-actions-frontend-tutorial.s3-website-us-east-1.amazonaws.com/).

To check the url of the bucket, go to the properties of the bucket, in the static website section.

## 1. Create the GitHub Actions Workflows

The final workflow file for frontend is [this](../.github/workflows/frontend.yml).

### 1.1 Definition of the Workflow

The first step to define the workflow is to define the name with the `name` reserved keyword.

After that we need to define the `on` keyword, which indicates when this workflow is going to be triggered.

In this case, we will only trigger the workflow when the `main` branch receives a new commit (directly push or merged pull request).

```yaml
# This is the name of the workflow
name: Frontend Workflow

# Definition of the events that triggers the workflow
on:
  push:
    # We will only run this on a push in
    #   the main branch
    branches: [main]
...
```

### 1.2 Definition of the Jobs

We will have four jobs in our workflow:
- Formatting
- Test
- Build
- Deploy

#### 1.2.1 Formatting Job

This job is the first one to run and is used to verify that the code is correctly formatted. To verify this we're using [prettier](https://prettier.io/), one of the most popular tools for javascript.

```yaml
    ...

    webinar-formatting: # name of the job
        runs-on: ubuntu-latest # Where the job is going to be executed
        steps:
            - uses: actions/checkout@v2 # Checkout the code in new environment
            - name: Prettify code # Define a job with a specific name
            uses: creyD/prettier_action@v4.2
            with:
                prettier_options: --check frontend/**/*.{js,ts,tsx,md} # Check if the code is formatted correctly

    ...
```

#### 1.2.2 Test Job

The test job is going to be run in parallel with the previous job, which means it will be taking less time to complete.

This job is a special job as it contains a special feature named `matrix`. This feature let us create multiple sub-jobs based on certain parameters, in this case, the os type and node version. The matrix contains two variables with two and three values respectively, which means we will have six (all combinations of both variables) different test scenarios.

```yaml
...
webinar-test: # Name of the job
    runs-on: ubuntu-latest # Where the job is going to be executed
    strategy:
      matrix:
        # Define variable 'os'
        os: [ubuntu-latest, windows-2016]
        # Define variable 'node-version'
        node-version: [12.x, 14.x, 16.x]
    steps:
      - uses: actions/checkout@v2 # Checkout the code in new environment
      - name: Using Node.js ${{ matrix.node-version }} # Name of the job depending on the 'node-version' variable
        uses: actions/setup-node@v2
        with:
          # Configure node depending on the 'node-version' variable
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      # Install dependencies
      - run: cd frontend && npm ci
      # Run the project unit tests
      - run: cd frontend && npm test
...
```

#### 1.2.3 Build Job
This job is focused on build the static files based on our React project. This is why we only want to run this job in case the previous jobs ran successfully, because otherwise it wouldn't make sense to build the project with files with errors.

To indicate that we only want to run this job if another job or jobs were successful, we need to include the `needs` keyword.

Once the built step is run, we want to grab those generated static files, so we can upload them to the S3 instance. For this, we will use the GitHub Actions artifacts, that let us upload generated files so we can then use them however we want.

```yaml
...
    webinar-build: # Name of the job
        # We indicate that this will run only if the 'webinar-test' and 'webinar-formatting' job ran successfully.
        needs: [webinar-test, webinar-formatting]
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v2
        - name: Using Node.js 16.x
            uses: actions/setup-node@v2
            with:
                node-version: 16.x
                cache: "npm"
        - name: npm install and build project
            run: |
            cd frontend && npm ci && npm run build
        # Upload the contents of 'frontend/build/' to an artifact named 'webinar-static-build'
        - uses: actions/upload-artifact@v2
            with:
                name: webinar-static-build
                path: frontend/build/
...
```

#### 1.2.4 Deploy Job

Once we have the artifact build, we need to upload this recently created static files to the bucket. For this we will use an action which configures the AWS Credentials (you first need to set this as repository secrets inside the `Settings -> Secrets -> Actions -> Repository Secret`).

Additionally, we will only run this job in case the `webinar-build` job ran successfully.

```yaml
webinar-deploy:
    needs: webinar-build
    runs-on: ubuntu-latest
    steps:
      # Configuring the AWS credentials in the new environment
      - name: Set AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          # The secrets object is available to every action, we only need to define which key we want to assign
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      # We download the previously uploaded 'webinar-static-build' into the build/ folder.
      - uses: actions/download-artifact@v2
        with:
          name: webinar-static-build
          path: build/
      # We upload the content of the build/ folder into the bucket.
      - name: Deploy to AWS S3
        run: |
          aws s3 cp build/ s3://github-actions-frontend-tutorial --recursive
```

# Developing the Project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
