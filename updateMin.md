# How to update min version of project

This is a quick guide of how to update the minimal BCAI version found [here](https://github.com/cjohnson57/BCAI_Min)

## Python

In user and worker, run 

    pyinstaller --onefile execute.py

Will create execute.spec and three folders: build, dist, and \_\_pycache\_\_

Delete build, \_\_pycache\_\_, and execute.spec

Go into dist, cut execute into appropriate folder

## Javascript

In user and worker, run 

    pkg userCLI.js --targets node8-linux-x64

Replace workerCLI for worker obviously

Will create userCLI/workerCLI, cut into appropriate folder in min

## Contract

The contract .json's are added to the Javascript files at compile time. This means that to update the contract, simply do it here normally then recompile the Javascript.


