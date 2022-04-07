<p align="center">
    <a href="https://www.rondonia.fiocruz.br/laboratorios/bioinformatica-e-quimica-medicinal/" target="_blank">
        <img alt="Fiocruz Rondônia" src="./app/static/img/fiocruz-ro.png" style="display: block; margin: 0 auto; margin-bottom: 20px;"  width="50%" />
    </a>
</p>

<a href="http://visualdynamics.fiocruz.br/" target="_blank">
    <h1 align="center">Visual Dynamics</h1>
</a>

![GitHub repo size](https://img.shields.io/github/repo-size/LABIOQUIM/visualdynamics)
[![GitHub](https://img.shields.io/github/license/LABIOQUIM/visualdynamics)](https://github.com/LABIOQUIM/visualdynamics/blob/master/LICENSE)



Visual Dynamics is a web platform that automates the generation and execution of molecular dynamics with GROMACS and provides graphical outputs of said dynamic.

## Installation
As a web service that can be accessed at any time [here](http://visualdynamics.fiocruz.br/), you probably will only need to install it from scratch if you want to contribute or to self-host it, for that, we got you covered.

We recommend using Python 3.10, without Anaconda, as we manage our own virtual environment.

There's a `install.sh` script that gera everything ready for you. Note that this script actually supports only Arch and Debian based distros.

VisualDynamics needs 2 packages to work: `Grace` and `Gromacs`. The latter being built on both distros.

The app currently works with Gromacs 2018 and 2019. By default, we build and install 2018.  
### Note: We already do the following steps for you, they're here just to keep this close, in case you, or we need it

### Also note that in Arch Linux, `DGMX_BUILD_OWN_FFTW` must be set to `off` since Arch is a bleeding edge distro, it won't compile. You should install `fftw` from the distro official repos or from `aur`.

We already do this for you, but if you need it, these are the steps to build and install Gromacs  
If you prefer reading the official documentation, you can head [here](https://manual.gromacs.org/documentation/2018/install-guide/index.html)
```zsh
curl https://ftp.gromacs.org/gromacs/gromacs-2018.tar.gz --output gromacs-2018.tar.gz
tar xfz gromacs-2018.tar.gz
cd gromacs-2018
mkdir build
cd build
cmake .. -DGMX_BUILD_OWN_FFTW=ON -DREGRESSIONTEST_DOWNLOAD=ON
make
make check
sudo make install
source /usr/local/gromacs/bin/GMXRC
```
Note: Arch distros are bleeding edge, so you probably want to pick `fftw` from AUR, and set `-DGMX_BUILD_OWN_FFTW` to off.  
This should suffice to get your GROMACS up and running.  
With both our dependencies installed, we can then clone the repository and start our service
```sh
git clone git@github.com:LABIOQUIM/visualdynamics.git
cd visualdynamics
./install.sh
```
Note: If the `install.sh` finds the `gmx` or `gmx_d` command it will skip the build and instalation of gromacs, as it is already installed.  
When the installation ends you can just run `./run.sh` and the service will start, by default it will be accessible at `localhost:5000`.  
There'll be a file named `login.txt` that contains your generated admin user and password.

## License
The Visual Dynamics source code is available under the [MIT License](./LICENSE). Some of the dependencies are licensed differently, so watch out for them.
