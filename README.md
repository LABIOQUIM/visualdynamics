# Visual Dynamics
## Para realizar as dinâmicas é necessário ter instalado o GROMACS series 2019 ou 2020.
## To perform the dynamics, it is necessary to have installed the GROMACS 2019 or 2020 series.
- Acesse o link para realizar a instalação e siga o installation guide do site: <http://manual.gromacs.org/documentation/>
- Access the link to perform the installation follow the installation guide from the website: <http://manual.gromacs.org/documentation/>

### Manual para instalação do Visual Dynamics em distribuições baseadas no Debian.
### Installation guide Visual Dynamics on Debian-based distributions.

#### Abra o seu terminal para Iniciar a instalação.
#### Open your terminal to start the installation.

##### É necessário ter o git instalado. 
Instalar(Install) git: 
~~~Shell scripts 
> sudo apt-get install git
~~~
- Clone o repositório do projeto visualdynamics:
- Clone the visualdynamics project repository:
~~~Shell scripts
> git clone git@github.com:LABIOQUIM/visualdynamics.git
~~~
- Acesse à pasta **visualdynamics** no seu terminal:
- Access the **visualdynamics** folder on your terminal: 
~~~Shell scripts
> cd visualdynamics
~~~
- Execute os comandos:
- Run the commands:
~~~Shell scripts
> chmod +x install.sh
> ./install.sh
~~~

### Ao fim da instalação o servidor será iniciado.
### At the end of the installation the server will start.

###### Caso tenha saido da pasta visualdynamics acesse ela novamente pelo terminal.
###### If you left the visualdynamics folder, access it again through the terminal.
- Para executar a aplicação após a instalação, execute o comando:
- To run the application after installation, run the command:
~~~Shell scripts
./run.sh
~~~


