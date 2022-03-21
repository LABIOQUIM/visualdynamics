#!/bin/bash
echo "Atenção ao executar a instalação os registros do banco de dados serão apagados."
echo "Se for a primeira instalação não se preocupe com isso, será gerado um novo login de admin que será salvo no arquivo login.txt."
echo "Caso você já tenha o Visual Dynamics instalado, cuidado! Se realizar a instalação novamente o banco de dados será totalmente limpo."
echo "ATENÇÃO!!! ESTE É UM PROCESSO AUTOMATIZADO E DEMORADO CASO VOCÊ ESTEJA UTILIZANDO UMA DISTRO BASEADA NO ARCHLINUX,"
echo "CASO NÃO ESTEJA EM UMA DISTRUBUIÇÃO BASEADA EM ARCHLINUX, O PROCESSO É DEMORADO E DEVE SER FEITO MANUALMENTE SEGUINDO AS INSTRUÇÕES"
echo "DISPONÍVEIS NO REPOSITÓRIO https://github.com/LABIOQUIM/visualdynamics"
echo "Confirmar instalação? (y = confirmar/n = cancelar)"
read resp

if [ $resp = 'y' ]; then
    if [ -f "/etc/arch-release" ]; then
        # Arch Linux or variant detected
        # Make sure what we need is installed
        sudo pacman -S cmake gcc python python-pip fftw unzip --noconfirm

        # Go to our working dir
        cd libs

        # In Arch we use paru as our main AUR helper
        if pacman -Qi paru > /dev/null; then
            echo "Paru já instalado, pulando etapa..."
        else
            echo "Compilando e Instalando paru..."
            git clone https://aur.archlinux.org/paru.git
            cd paru && makepkg -si
            echo "Limpando pastas..."
            cd .. && rm -rf paru
        fi

        if pacman -Qi grace > /dev/null; then
            echo "Grace já instalado, pulando etapa..."
        else
            echo "Compilando e instalando Grace..."
            cd grace
            paru -Ui --noconfirm
            cd ..
        fi

        # Leave working dir/go back to visualdynamics root
        cd ..
    else
        # We'll assume Debian or variant
        # Make sure what we need is installed
        sudo apt install cmake gcc python3 python3-pip git grace unzip fftw3 -y
    fi

    source compile-and-install-gromacs-2018.sh

    # Install and initialize our virtual environment
    sudo pip3 install virtualenv
    virtualenv venv
    source venv/bin/activate
    
    # Install our project dependencies
    pip3 install -r requirements.txt

    # Clear our SQLite DB
    python3 clear_database.py

    # Make sure our DB and our md_pr file don't go to VCS
    git update-index --assume-unchanged app/app.db mdpfiles/md_pr.mdp

    # Make our app starters executable
    chmod +x run-dev.sh
    chmod +x run-prod.sh

    # Compile our app translations
    flask translate compile
    echo "Instalação Concluída. Para executar a aplicação execute o arquivo run.sh que está na raiz do projeto."  

elif [ $resp = 'n' ]; then
    echo "Instalação cancelada."

else
    echo "Opção inválida."

fi

