if [ -f "/etc/arch-release" ]; then
	if pacman -Qi paru > /dev/null; then
		echo ">>> GROMACS já instalado"
	else
	# Enter working dir
    cd libs/gromacs

    # Unzip GROMACS source code
    unzip gromacs.zip

    # Make and prepare GROMACS build folder
    mkdir -p build
    cd build
    cmake ../gromacs-2018/ \
        -DCMAKE_INSTALL_PREFIX=/usr/ \
        -DCMAKE_INSTALL_LIBDIR=lib \
        -DGMX_BUILD_OWN_FFTW=off \
        -DGMX_HWLOC=off

    # Build GROMACS
    make -j$(nproc)

    # Then check our build
    make check

    # Install our package
    sudo make install

    # Append GMXRC to our .zshrc or .bash_profile
    if [ -f ~/.zshrc ]; then
        if ! grep -Fxq "source /usr/bin/GMXRC" ~/.zshrc; then
            # Not written, so write
            echo "source /usr/bin/GMXRC" >> ~/.zshrc
        fi
    else
        if ! grep -Fxq "source /usr/local/gromacs/bin/GMXRC" ~/.bash_profile; then
            # Not written, so write
            echo "source /usr/local/gromacs/bin/GMXRC" >> ~/.bash_profile
        fi
    fi

    # Leave working dir/go back to visualdynamics root
    cd ../../..
	fi
else
	if dpkg -s gromacs &> /dev/null; then
		echo "GROMACS already installed"
	else
		# Enter working dir
    cd libs/gromacs

    # Unzip GROMACS source code
    unzip gromacs.zip

    # Make and prepare GROMACS build folder
    mkdir -p build
    cd build
    cmake ../gromacs-2018/ \
        -DCMAKE_INSTALL_PREFIX=/usr/ \
        -DCMAKE_INSTALL_LIBDIR=lib \
        -DGMX_BUILD_OWN_FFTW=on \
        -DGMX_HWLOC=off

    # Build GROMACS
    make -j$(nproc)

    # Then check our build
    make check

    # Install our package
    sudo make install

    # Append GMXRC to our .zshrc or .bash_profile
    if [ -f ~/.zshrc ]; then
        if ! grep -Fxq "source /usr/bin/GMXRC" ~/.zshrc; then
            # Not written, so write
            echo "source /usr/bin/GMXRC" >> ~/.zshrc
        fi
    else
        if ! grep -Fxq "source /usr/local/gromacs/bin/GMXRC" ~/.bash_profile; then
            # Not written, so write
            echo "source /usr/local/gromacs/bin/GMXRC" >> ~/.bash_profile
        fi
    fi

    # Leave working dir/go back to visualdynamics root
    cd ../../..
	fi
fi