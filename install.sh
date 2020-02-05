#!/bin/bash
#script sh install Visual Dynamics
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
echo "Para executar a aplicacao novamente depois da instalacao, execute o arquivo run.sh que esta na pasta visualdynamics." 
echo "Para finalizar a excução precione Ctrl + c"
flask run

#End
