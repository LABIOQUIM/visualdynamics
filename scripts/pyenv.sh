#!bin/bash
if [ -d "/home/$USER/.pyenv/" ]; then
  echo "Pyenv found, skipping..."
else
  echo "Installing Pyenv"
  curl https://pyenv.run | bash
fi

if [ -d "/home/$USER/.pyenv/versions/3.7.13" ]; then
  echo "Python 3.7.13 found, skipping..."
else
  echo "Installing Python 3.7.13"
  pyenv install 3.7.13 > /dev/null
fi

# Sets python 3.7.13 as default
pyenv global 3.7.13
echo $SHELL