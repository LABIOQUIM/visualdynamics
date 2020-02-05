#!/bin/bash
source venv/bin/activate
#init server
export FLASK_ENV=development
echo "Para finalizar a excução precione Ctrl + c" 
flask run

