export PIP_IGNORE_INSTALLED=0
SHELL_NAME="${SHELL##*/}"
CONDA_PATH="$HOME/.conda"

echo
chmod +x ./scripts/config.sh
source ./scripts/config.sh
source ./config
echo

if type "conda" &> /dev/null;
then
	re="base environment : /[a-zA-Z]+/[a-zA-Z]+/[A-Za-z0-9.]+\s \(writable\)"
	CONDA_INFO="$(conda info)"
	if [[ $CONDA_INFO =~ $re ]]; then
		BASE_ENV=${BASH_REMATCH}

		re2="/[a-zA-Z]+/[a-zA-Z]+/[A-Za-z0-9.]+\s"

		if [[ $BASE_ENV =~ $re2 ]]; then
			CONDA_PATH="${BASH_REMATCH// }"
		fi
	fi
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
  eval "$(${CONDA_PATH}/bin/conda shell.$SHELL_NAME hook)"
  conda init $SHELL_NAME
  conda config --set auto_activate_base false
  echo "==> Miniconda installed to $CONDA_PATH"
  rm miniconda.sh
fi

echo "=> Verifying and Installing Dependencies"
if [ -f "/etc/arch-release" ]; then
  sudo pacman -S git --needed --noconfirm

	if ! type gracebat &> /dev/null;
	then
		git clone https://aur.archlinux.org/grace.git
		cd grace && makepkg -si && cd .. && rm -rf grace
	fi
else
	sudo apt install git grace -y
fi
echo "=> Dependencies OK!"

echo "=> Initializing Environment and Dependencies"
eval "$(${CONDA_PATH}/bin/conda shell.$SHELL_NAME hook)"
# Init and install Conda and Project Dependencies
if ! { conda env list | grep 'visualdynamics'; } > /dev/null 2>&1; then
  conda env create -f ./environment.yml
else
	conda env update -f ./environment.yml
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
# Make sure our DB file don't go to VCS
git update-index --assume-unchanged app/app.db
echo "> VisualDynamics is now ready. See ./run -h to start the application"  
