#!bin/bash
# Arch Linux or variant detected
# Make sure what we need is installed
echo "==> Checking in cmake, gcc, unzip and fftw"
sudo pacman -S cmake gcc fftw unzip --noconfirm --needed > /dev/null
echo "==> Checked cmake, gcc, unzip and fftw"

# Go to our working dir
cd libs

# In Arch we use paru as our main AUR helper
echo "==> Checking in Paru"
if pacman -Qi paru > /dev/null; then
  echo "===> Paru found, skipping..."
else
  echo "===> Paru not found, installing..."
  git clone https://aur.archlinux.org/paru.git
  cd paru && makepkg -si
  echo "===> Paru installed, cleaning work dir..."
  cd .. && rm -rf paru
  echo "===> work dir cleaned"
fi
echo "==> Paru OK"

echo "==> Checking in GRACE"
if pacman -Qi grace > /dev/null; then
  echo "===> Grace found, skipping..."
else
  echo "===> Grace not found, installing..."
  cd grace
  paru -Ui --noconfirm
  cd ..
  echo "===> Grace installed..."
fi
echo "==> GRACE OK"

# Leave working dir/go back to visualdynamics root
cd ..