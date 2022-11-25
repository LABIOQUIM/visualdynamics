echo "==> Checking in GROMACS"
if { ls /usr/bin/gmx &> /dev/null || ls /usr/bin/gmx_d &> /dev/null; } then
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

  echo "====> Generating GROMACS makefile"
  if type "nvcc" > /dev/null 2>&1; then
    cmake -DGMX_GPU=on ../gromacs-2018/ -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=on -DGMX_HWLOC=off > /dev/null 2>&1
  else
    cmake ../gromacs-2018/ -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=on -DGMX_HWLOC=off > /dev/null 2>&1
  fi
  echo "====> Generated GROMACS makefile"

  echo "====> Building GROMACS"
  # Build GROMACS
  make -j$(nproc --ignore 1)
  echo "====> Built GROMACS"

  # Then check our build
  echo "====> Running checks"
  make check

  # Install our package
  echo "====> Installing GROMACS"
  sudo make install

  echo "====> GROMACS installed, cleaning work dir..."
  # Leave working dir/go back to visualdynamics root
  cd ../../..

  # Append GMXRC to our .zshrc or .bash_profile
  if ! grep -Fxq "source /usr/bin/GMXRC" ./config; then
    # Not written, so write
    echo "source /usr/bin/GMXRC" >> ./config
  fi
fi