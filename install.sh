#!/bin/bash
#script sh install Visual Dynamics
echo "Atencao ao executar a instalacao os registros do banco de dados serao apagados."
echo "Se for a primeira instalacao nao se preocupe com isso, sera gerado um novo login de admin que sera salvo no arquivo login.txt."
echo "Caso voce já tenha o visual dynamics instalado, cuidado! Se realizar a instalacao novamente o banco de dados sera totalmente limpo."
echo "Confirmar instalacao?(y = confirmar/n = cancelar)"
read resp
if [ $resp = y ];
    then
        #install python3.7 e pip
        sudo apt install python3.7
        sudo apt install python3-pip
        #install grace
        sudo apt install grace
        #install virtualenv
        sudo pip3 install virtualenv
        #install git
        sudo apt install git
        cd app
        git update-index --assume-unchanged app.db
        cd ..
        #create venv
        virtualenv venv
        #init venv
        source venv/bin/activate
        #install requirements
        pip3 install -r requirements.txt
        python cleardb.py
        chmod +x run.sh
        #init server
        export FLASK_ENV=development
        echo "Para executar a aplicacao novamente depois desta instalacao, execute o arquivo run.sh que esta na pasta visualdynamics." 
        echo "Para finalizar a excução precione Ctrl + c"
        flask run

elif [ $resp = n ];
    then
        echo "Instacao cancelada."

else 
    echo "Opcao invalida."

fi
#End
