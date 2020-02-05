#!/bin/bash
source venv/bin/activate
pip3 install -r requirements.txt
#init server
export FLASK_ENV=development
echo "Para finalizar a excução precione Ctrl + c" 
flask run

