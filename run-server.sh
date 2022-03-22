#!/bin/bash
source venv/bin/activate
#init server
export FLASK_ENV=production
echo "Para finalizar a excução pressione Ctrl + C" 
flask run --host=0.0.0.0 --port=8080

