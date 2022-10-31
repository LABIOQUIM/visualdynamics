echo "==> Checking in GROMACS"
if ! { ls /usr/bin/gmx &> /dev/null || ls /usr/bin/gmx_d &> /dev/null; } then
  echo "===> GROMACS found, skipping..."
else
  echo "===> GROMACS not found, installing..."
  # Enter working dir
  cd libs/gromacs

  echo "====> Unpacking GROMACS 2018"
  # Unzip GROMACS source code
  unzip -o gromacs.zip > /dev/null
  echo "====> Unpacked GROMACS 2018"

  # Make and prepare GROMACS build folder
  mkdir -p build
  cd build
  if [ -f "/etc/arch-release" ]; then
    if [ $1 == 'gpu' ] || [ $1 == 'GPU' ]; then
      echo "====> Installing CUDA Toolkit"
      sudo pacman -S cuda --needed
      echo "====> Generating GROMACS makefile without FFTW"
      cmake -DGMX_GPU=on -DCMAKE_RULE_MESSAGES=OFF ../gromacs-2018/  -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=off -DGMX_HWLOC=off > /dev/null 2>&1
      echo "====> Generated GROMACS makefile without FFTW"
    else
      echo "====> Generating GROMACS makefile without FFTW"
      cmake -DCMAKE_RULE_MESSAGES=OFF ../gromacs-2018/  -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=off -DGMX_HWLOC=off > /dev/null 2>&1
      echo "====> Generated GROMACS makefile without FFTW"
    fi
  else
    if [ $1 == 'gpu' ] || [ $1 == 'GPU' ]; then
      echo "====> Installing CUDA Toolkit"
      wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      sudo dpkg -i cuda-keyring_1.0-1_all.deb
      sudo apt-get update
      sudo apt-get -y install cuda
      echo "====> Generating GROMACS makefile with FFTW"
      cmake -DGMX_GPU=on -DCMAKE_RULE_MESSAGES=OFF ../gromacs-2018/ -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=on -DGMX_HWLOC=off > /dev/null 2>&1
      echo "====> Generated GROMACS makefile with FFTW"
    else
      echo "====> Generating GROMACS makefile with FFTW"
      cmake -DCMAKE_RULE_MESSAGES=OFF ../gromacs-2018/ -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=on -DGMX_HWLOC=off > /dev/null 2>&1
      echo "====> Generated GROMACS makefile with FFTW"
    fi
  fi

  echo "====> Building GROMACS"
  # Build GROMACS
  make -j$(nproc - 1)
  echo "====> Built GROMACS"

  # Then check our build
  make check > /dev/null 2>&1

  # Install our package
  sudo make install > /dev/null 2>&1

  # Append GMXRC to our .zshrc or .bash_profile
  if ! grep -Fxq "source /usr/bin/GMXRC" ../config; then
    # Not written, so write
    echo "source /usr/bin/GMXRC" >> ../config
  fi
  echo "====> GROMACS installed, cleaning work dir..."
  # Leave working dir/go back to visualdynamics root
  cd ../../..
fi