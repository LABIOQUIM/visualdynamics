#!/bin/bash
############################################################
# Help                                                     #
############################################################
Help() {
  # Display Help
  echo "Add description of the script functions here."
  echo
  echo "Syntax: ./run.sh [-h|m]"
  echo "options:"
  echo "m     Specify the execution mode (dev|prod)."
  echo "h     Print this Help."
  echo
}

############################################################
# StartService                                             #
############################################################
StartService() {
  echo ">> Starting VisualDynamics in $1 mode"
  echo ">> To end the server press Ctrl + C"
  
  source venv/bin/activate

  if [ $1 == 'dev' ]; then
    export FLASK_ENV=development
    flask run --host=0.0.0.0
  else
    echo ">> Staring server on http://0.0.0.0:8080"
    python3 visualdynamics.py
  fi
}

############################################################
# Main program                                             #
############################################################
while getopts ":hm:" option; do
  case $option in
    h) # display Help
      Help
      exit;;
    m) # start the application in the selected mode
      StartService "$OPTARG";;
    \?) # Invalid option
      echo "Error: Invalid option"
      exit;;
  esac
done

