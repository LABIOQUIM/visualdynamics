if [ -f "/etc/arch-release" ]; then
	if ls /usr/bin/gmx &> /dev/null || ls /usr/bin/gmx_d &> /dev/null; then
		echo ">>> GROMACS found, skipping..."
	else
    echo ">>> GROMACS not found, installing..."
    # Enter working dir
    cd libs/gromacs

    # Unzip GROMACS source code
    unzip -o gromacs.zip > /dev/null

    # Make and prepare GROMACS build folder
    mkdir -p build
    cd build
    if [ -f "/etc/arch-release" ]; then
      cmake ../gromacs-2018/  -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=off -DGMX_HWLOC=off
    else
      cmake ../gromacs-2018/ -DCMAKE_INSTALL_PREFIX=/usr/ -DCMAKE_INSTALL_LIBDIR=lib -DGMX_BUILD_OWN_FFTW=on -DGMX_HWLOC=off
    fi

    # Build GROMACS
    make -j$(nproc)

    # Then check our build
    make check

    # Install our package
    sudo make install

    # Append GMXRC to our .zshrc or .bash_profile
		if ! grep -Fxq "source /usr/bin/GMXRC" ../config; then
      # Not written, so write
      echo "source /usr/bin/GMXRC" >> ../config
		fi
    echo ">>> GROMACS installed, cleaning work dir..."
    # Leave working dir/go back to visualdynamics root
    cd ../../..
	fi
fi