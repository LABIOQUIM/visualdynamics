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
        echo "Sistema baseado em ArchLinux, instalando e compilando GROMACS, GRACE e pip..."
        echo "FIQUE ATENTO, SUA AÇÃO SERÁ NECESSÁRIA EM ALGUMAS ETAPAS DA INSTALAÇÃO!!!"
        sudo pacman -S python-pip fftw --noconfirm

        cd arch

        if pacman -Qi paru > /dev/null; then
            echo "Paru já instalado, pulando etapa..."
        else
            echo "Compilando e Instalando PARU..."
            git clone https://aur.archlinux.org/paru.git
            cd paru && makepkg -si
            echo "Limpando pastas utilizadas na configuração do PARU..."
            cd .. && rm -rf paru
        fi

        if pacman -Qi gromacs > /dev/null; then
            echo "GROMACS instalado, pulando etapa..."
        else
            echo "Compilando e instalando GROMACS..."
            cd gromacs
            paru -Ui --noconfirm
            cd ..
        fi

        if pacman -Qi grace > /dev/null; then
            echo "GRACE já instalado, pulando etapa..."
        else
            echo "Compilando e instalando GRACE..."
            cd grace
            paru -Ui --noconfirm
            cd ..
        fi

        if pacman -Qi python37 > /dev/null; then
            echo "python3.7 já instalado, pulando etapa..."
        else
            echo "Instalando Python 3.7..."
            paru -S python37 --noconfirm
        fi

        cd ..

        sudo pip install virtualenv

        echo "Inicializando Python VirtualEnv"
        # create venv
        virtualenv venv --python=/usr/bin/python3.7
        # init venv
        source venv/bin/activate

        echo "Instalando dependências..."
        
        # install requirements
        pip3 install -r ./requirements.txt
        python ./clear_database.py
    else
        echo "Sistema baseado em Debian/Ubuntu, instalação automática do GROMACS não disponível, faça manualmente..."
        echo "Instalando GRACE e pip..."
        # install python3.7 e pip
        sudo apt install python3 python3-pip python3-venv git grace
        python3 -m venv venv
        source venv/bin/activate

        pip3 install -r requirements.txt
        python3 ./clear_database.py 
    fi

    git update-index --assume-unchanged app/app.db mdpfiles/md_pr.mdp
    chmod +x run.sh
    flask translate compile
    echo "Instalação Concluída. Para executar a aplicação execute o arquivo run.sh que está na raiz do projeto."  

elif [ $resp = 'n' ];
    then
        echo "Instalação cancelada."

else
    echo "Opção inválida."

fi
#End

