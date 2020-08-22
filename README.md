# BCAI
This is a LSU project.

## How to install
Take file install.bash and run with ```sudo bash install.bash``` in the directory which you would like the BCAI directory to be.
It will download this repo, the onionshare repo, and install all required software/pip3 packages/npm packages needed to run the project.

## How to run user
Users upload ML tasks to be performed by providers and pay them in ether cryptocurrency.

In ML/localUser place your docker task file named image.zip

In the main directory run ```bash startUser.bash``` this will open two terminal tabs:

1) The CLI where you interact with the application to submit your task, choose providers and validators, and finalize your request.

2) The python script for file upload and transfer. All you have to do here is input your password for sudo.

	Though no further interaction is needed, this terminal will display information on your file upload and transfer.

In the CLI you can either continue using the CLI to use the program or open the web page.

The following steps must take place for your task to be completed:

1) Submit your task with filename

2) Wait for your file to finish hosting

3) Choose a provider who will then download the task

4) Once the provider executes the task, choose a validator to validate

5) Once validation is complete you will automatically start downloading your result file

6) After receiving your result,  finalize your request, giving a rating to your provider based on the correctness and quality of the result.

## How to run provider
Providers execute ML tasks for users and are paid for their work in ether cryptocurrency.

In the main directory run ```bash startWorker.bash``` this will open two terminal tabs:

1) The CLI where you interact with the application to start providing or check things such as your rating and balance.

2) The python script for file upload and transfer. All you have to do here is input your password for sudo.

	Though no further interaction is needed, this terminal will display information on your file upload and transfer.

In the CLI you can either continue using the CLI to use the program or open the web page.

Once you start providing, no interaction is needed to continue completing tasks.

## Important Code

### User

User CLI interface: [userCLI.js](ML/localUser/userCLI.js)

User file host/transfer: [execute.py](ML/localUser/execute.py)

User web page (js, html, css): [WebPage](ML/localUser/WebPage)

### Provider

Provider CLI interface: [workerCLI.js](ML/localWorker/workerCLI.js)

Provider file host/transfer: [execute.py](ML/localWorker/execute.py)

Provider web page (js, html, css): [WebPage](ML/localWorker/WebPage)

### Other

Smart contract: [bcai.sol](bcai_deploy/contracts/bcai.sol)

Install script: [install.bash](install.bash)

## Other info
Please do not close any of the terminals or the web page until you have finished/stopped your request or providing.

If you have any issues please contact with a copy of log.txt and describe the issue.
