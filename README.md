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

Visual Dynamics is a web platform that automates the generation and execution of molecular dynamics with GROMACS and provides some useful and nice graphical outputs.

## Quick Start
Open up a terminal and run `source <(curl -s -L https://bit.ly/vdinstall)`

## Not So Quick Start
If you're the type that wants to do everything by your own hands, you'll need to build `GROMACS`, for that, [head out to their documentation](https://manual.gromacs.org/).

You'll need [Grace](https://plasma-gate.weizmann.ac.il/Grace/) too.

With both of them on hand, you'll need [Miniconda](https://docs.conda.io/en/latest/miniconda.html#installing), our chosen Python package manager.

With Miniconda in place, now you'll should run `conda env create -f ./environment.yml`, this will ready a private python environment with the necessary dependencies for Visual Dynamics.

You're almost ready, just more 30 minutes or so and you'll get it running... I said that this wasn't quick.

Now you'll need a `config` file on the root project folder, no extensions, just `config`. It is mandatory for it to have this format:
```bash
#!bin/bash
export VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL=
export VISUAL_DYNAMICS_NO_REPLY_EMAIL=
export VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD=
```
You fill the data required there, and you're again, almost ready.
##### Note that the data stored in this file never leaves your computer/server, so we won't be having access to it

The last thing here is on your terminal. Execute `flask translate compile`, so Visual Dynamics can prepare the translations. And that's it, you can now run `./run -m [prod|dev]`
## License
The Visual Dynamics source code is available under the [MIT License](./LICENSE). Some of the dependencies are licensed differently, so watch out for them.
