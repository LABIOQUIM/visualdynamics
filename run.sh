#!/bin/bash
source venv/bin/activate
#init server
export FLASK_ENV=development
echo "Para finalizar a excução pressione Ctrl + C" 
flask run

