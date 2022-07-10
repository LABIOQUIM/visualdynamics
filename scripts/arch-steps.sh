#!bin/bash
# Arch Linux or variant detected
# Make sure what we need is installed
sudo pacman -S cmake gcc python-pip fftw unzip --noconfirm --needed > /dev/null

# Go to our working dir
cd libs

# In Arch we use paru as our main AUR helper
if pacman -Qi paru > /dev/null; then
  echo ">>> Paru found, skipping..."
else
  echo ">>> Paru not found, installing..."
  git clone https://aur.archlinux.org/paru.git
  cd paru && makepkg -si
  echo ">>> Paru installed, cleaning work dir..."
  cd .. && rm -rf paru
fi

if pacman -Qi grace > /dev/null; then
  echo ">>> Grace found, skipping..."
else
  echo ">>> Grace not found, installing..."
  cd grace
  paru -Ui --noconfirm
  echo ">>> Grace installed, cleaning work dir..."
  cd ..
fi

# Leave working dir/go back to visualdynamics root
cd ..