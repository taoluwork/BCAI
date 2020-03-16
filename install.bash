#Initializing time
start=$(date +%s%N | cut -b1-13) #time in milliseconds
#Changing directory
dir=$(pwd | grep -o '[^/]*$')
downloadgit=true
if [ $# -eq 0 ] ;#No argument provided, install here
then
    echo -e "\e[93mInstalling here."
else
    if [ -d "$1" ] #If directory exists
    then
        echo -e "\e[93mInstalling at " $1
        cd $1
    else #Does not exist
        echo -e "\e[91mProvided directory not found!"
        exit #exit script execution
    fi
fi
if [ -d "BCAI" ] ;#if BCAI folder already exists, remove it
then
    read -p $'\e[91mBCAI already exists, remove? \e[0m[Y/N] ' remove
    case "$remove" in
        [yY][eE][sS]|[yY]) 
            rm -rf "BCAI"
            echo -e "\e[92mSuccessfully removed previous BCAI."
            ;;
        *)
            read -p $'\e[91mDo you just want to install software and npm packages? \e[0m[Y/N] ' remove
            case "$remove" in
                [yY][eE][sS]|[yY]) 
                    echo -e "\e[92mJust installing software and npm packages."
                    downloadgit=false
                    ;;
                *)
                    echo -e "\e[91mChose not to remove, aborting installation."
                    exit
                    ;;
            esac 
            ;;
    esac  
fi
###################################Installing Programs###################################
#Install git
if ! git --version > /dev/null 2>&1 ;  #git not installed
then
    echo -e "\e[93mgit not installed, installing now.\e[0m"
    add-apt-repository ppa:git-core/ppa -y
    apt-get update
    if apt-get install git --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[92mgit successfully installed."
    else  #problem installing
        echo -e "\e[91mProblem installing git. Aborting installation."
        exit
    fi
else
    echo -e "\e[92mgit already installed."
fi
#Install npm
if ! npm --version > /dev/null 2>&1 ; #npm not installed
then
    echo -e "\e[93mnpm not installed, installing now.\e[0m"
    if sudo apt install npm --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[92mnpm successfully installed."
    else  #problem installing
        echo -e "\e[91mProblem installing npm. Aborting installation."
        exit
    fi
else
    echo -e "\e[92mnpm already installed."
fi
#Install node
if ! node --version > /dev/null 2>&1 ; #node not installed
then
    echo -e "\e[93mnode not installed, installing now.\e[0m"
    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
    if sudo apt install nodejs --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[92mnode successfully installed."
    else  #problem installing
        echo -e "\e[91mProblem installing node. Aborting installation."
        exit
    fi
else
    echo -e "\e[92mnode already installed."
fi
#Install python
if ! python3 --version > /dev/null 2>&1 ; #python not installed
then
    echo -e "\e[93mpython not installed, installing now.\e[0m"
    if sudo apt install python3 --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[92mpython successfully installed."
    else  #problem installing
        echo -e "\e[91mProblem installing python. Aborting installation."
        exit
    fi
else
    echo -e "\e[92mpython already installed."
fi
#Install tor
if ! tor --version > /dev/null 2>&1 ; #tor not installed
then
    echo -e "\e[93mtor not installed, installing now.\e[0m"
    if sudo apt install tor --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[92mtor successfully installed."
    else  #problem installing
        echo -e "\e[91mProblem installing tor. Aborting installation."
        exit
    fi
else
    echo -e "\e[92mtor already installed."
fi
#Install docker
if ! docker --version > /dev/null 2>&1 ;  #docker not installed
then
    echo -e "\e[93mDocker not installed, installing now.\e[0m"
    sudo apt-get update
    if sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[93mInstalling...\e[0m"
    else  #problem installing
        echo -e "\e[91mProblem installing Docker. Aborting installation."
        exit
    fi
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo apt-key fingerprint 0EBFCD88
    #this should return this:
    #    pub   rsa4096 2017-02-22 [SCEA]
    #          9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
    #    uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
    #    sub   rsa4096 2017-02-22 [S]
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    if sudo apt-get install docker-ce docker-ce-cli containerd.io --yes --force-yes > /dev/null 2>&1 ; then #if installed
        echo -e "\e[92mDocker successfully installed."
    else  #problem installing
        echo -e "\e[91mProblem installing Docker. Aborting installation."
        exit
    fi
else
    echo -e "\e[92mdocker already installed."
fi
#Download repo
if [ "$downloadgit" = true ] ; then
    echo -e "\e[93m----------------------------Downloading github repo.----------------------------\e[0m"
    if git clone https://github.com/PedroGRivera/BCAI.git ; then #if downloaded
        echo -e "\e[92mGithub repo successfully downloaded."
    else  #problem downloading
        echo -e "\e[91mProblem downlodding repo. Aborting installation."
        exit
    fi
fi
#Download onionshare repo
echo -e "\e[93m----------------------------Downloading onionshare repo.----------------------------\e[0m"
if git clone https://github.com/micahflee/onionshare.git ; then #if downloaded
    echo -e "\e[92mOnionshare repo successfully downloaded."
else  #problem downloading
    echo -e "\e[91mProblem downloading onionshare repo. Aborting installation."
    exit
fi
###################################Installing npm packages###################################
#Install npm stuff for localuser
cd BCAI/ML/localUser/
echo -e "\e[93m---------------------Installing npm packages for localUser.---------------------\e[0m"
if npm install ; then #if installed
    echo -e "\e[92mnpm packages for localUser successfully installed."
else  #problem installing
    read -p $'\e[91mnpm installation failed without sudo. Try again with sudo? [Y/N]\e[0m ' tryagain
    case "$tryagain" in #try again with sudo this time
        [yY][eE][sS]|[yY]) 
            if sudo npm install ; then #if installed
                echo -e "\e[92mnpm packages for localUser successfully installed."
            else 
                "\e[91mProblem installing npm packages for localUser. Aborting installation."
                exit
            fi
            ;;
        *)
            echo -e "\e[91mChose not to try with sudo, aborting installation."
            exit
            ;;
    esac
fi
#Install npm stuff for localworker
cd .. #back up to ML
cd localWorker/
echo -e "\e[93m--------------------Installing npm packages for localWorker.--------------------\e[0m"
if npm install ; then #if installed
    echo -e "\e[92mnpm packages for localWorker successfully installed."
else  #problem installing
    read -p $'\e[91mnpm installation failed without sudo. Try again with sudo? [Y/N]\e[0m ' tryagain
    case "$tryagain" in #try again with sudo this time
        [yY][eE][sS]|[yY]) 
            if sudo npm install ; then #if installed
                echo -e "\e[92mnpm packages for localWorker successfully installed."
            else 
                "\e[91mProblem installing npm packages for localWorker. Aborting installation."
                exit
            fi
            ;;
        *)
            echo -e "\e[91mChose not to try with sudo, aborting installation."
            exit
            ;;
    esac
fi
#Finishing up
echo -e "\e[92mInstallation successful. Run startUser.bash or startWorker.bash without sudo to start the program.\e[0m"
end=$(date +%s%N | cut -b1-13) #time in milliseconds
difference=$((end - start)) #time from start to end
diffsec=$((difference / 1000)) #time in seconds
echo -e "\e[93mTotal time taken: $diffsec seconds\e[0m" #display time
exit #finished!