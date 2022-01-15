#!/bin/bash
#script sh install Visual Dynamics
echo "Atenção ao executar a instalação os registros do banco de dados serão apagados."
echo "Se for a primeira instalação não se preocupe com isso, será gerado um novo login de admin que será salvo no arquivo login.txt."
echo "Caso você já tenha o Visual Dynamics instalado, cuidado! Se realizar a instalação novamente o banco de dados será totalmente limpo."
echo "Confirmar instalação?(y = confirmar/n = cancelar)"
read resp
if [ $resp = 'y' ];
    then
        # install python3.7 e pip
        sudo apt install python3-pip
        # install grace
        sudo apt install grace
        # install virtualenv
        sudo pip3 install virtualenv
        #install git
        sudo apt install git
        cd app
        git update-index --assume-unchanged app.db
        cd ../mdpfiles
        git update-index --assume-unchanged md_pr.mdp
        cd ..
        #create venv
        virtualenv venv
        #init venv
        source venv/bin/activate
        #install requirements
        pip3 install -r requirements.txt
        python clear_database.py 
        chmod +x run.sh
        echo "Instalação Concluída. Para executar a aplicação execute o arquivo run.sh que está na raiz do projeto."  

elif [ $resp = 'n' ];
    then
        echo "Instalação cancelada."

else 
    echo "Opção inválida."

fi
#End
