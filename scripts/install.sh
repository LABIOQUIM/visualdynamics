export PIP_IGNORE_INSTALLED=0
SHELL_NAME="${SHELL##*/}"

echo
chmod +x ./scripts/config.sh
source ./scripts/config.sh
source config
echo

if type "conda" &> /dev/null
then
  echo "=> Miniconda found, skipping..."
else
  echo "=> Installing Miniconda"
  echo "==> Miniconda will be installed on $HOME/.conda/"
  echo "==> It is highly recommended that you accept to run 'conda init'"
  echo "==> at the end of the miniconda install. If you forgot, you can"
  echo "==> run 'source ~/.conda/bin/activate' and then run 'conda init'"
  curl --progress-bar https://repo.anaconda.com/miniconda/Miniconda3-py39_4.12.0-Linux-x86_64.sh > miniconda.sh
  chmod +x miniconda.sh
  bash miniconda.sh -b -p $HOME/.conda
  eval "$(/home/$USER/.conda/bin/conda shell.$SHELL_NAME hook)"
  conda init $SHELL_NAME
  conda config --set auto_activate_base false
  echo "==> Miniconda installed to $HOME/.conda/"
  rm miniconda.sh
fi

echo "=> Verifying and Installing Dependencies"
sudo apt install cmake gcc git grace unzip libopenblas-dev -y > /dev/null 2>&1

chmod +x ./scripts/gromacs.sh
source ./scripts/gromacs.sh "$1"

echo "=> Dependencies OK!"

echo "=> Initializing Environment and Dependencies"
eval "$(/home/$USER/.conda/bin/conda shell.$SHELL_NAME hook)"
# Init and install Conda and Project Dependencies
if ! { conda env list | grep 'visualdynamics'; } > /dev/null 2>&1; then
  conda env create -f ./environment.yml
fi
conda activate visualdynamics
echo "=> Environment and Dependencies Initialized"

echo "=> Reset database"
# Clear our SQLite DB
python3 clear_database.py
echo "=> Database reset: OK"

# Compile our app translations
echo "=> Readying translations"
flask translate compile > /dev/null 2>&1
echo "=> Translations ready"

echo "=> Finishing things up..."
# Make sure our DB and our md_pr file don't go to VCS
git update-index --assume-unchanged app/app.db mdpfiles/md_pr.mdp
echo "> VisualDynamics is now ready. See ./run -h to start the application"  
