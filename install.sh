#!/bin/bash
echo "BEWARE. All data stored in the app/app.db will be lost."
echo "This is a automated process mainly, you might need to enter your password by continuing"
read -rsn1 -p "Do you wish to continue? (Y/n) " resp
resp=${resp:-Y}

if [ $resp = 'Y' ] || [ $resp = 'y' ]; then
    if [ -f "/etc/arch-release" ]; then
        # Arch Linux or variant detected
        # Make sure what we need is installed
        sudo pacman -S cmake gcc python python-pip fftw unzip --noconfirm --needed

        # Go to our working dir
        cd libs

        # In Arch we use paru as our main AUR helper
        if pacman -Qi paru > /dev/null; then
            echo ">>> Paru found, skipping..."
        else
            echo ">>> Paru not found, installing..."
            git clone https://aur.archlinux.org/paru.git
            cd paru && makepkg -si
            echo ">>> Paru installed, cleaning work dir..."
            cd .. && rm -rf paru
        fi

        if pacman -Qi grace > /dev/null; then
            echo ">>> Grace found, skipping..."
        else
            echo ">>> Grace not found, installing..."
            cd grace
            paru -Ui --noconfirm
            echo ">>> Grace installed, cleaning work dir..."
            cd ..
        fi

        # Leave working dir/go back to visualdynamics root
        cd ..
    else
        # We'll assume Debian or variant
        # Make sure what we need is installed
        sudo apt install cmake gcc python3 python3-pip git grace unzip -y
    fi

    echo ">>> Initializing Python Virtual Environment"
    pip3 install virtualenv > /dev/null
    virtualenv venv > /dev/null

    echo ">>> Validating GROMACS"
    chmod +x compile-and-install-gromacs-2018.sh
    source compile-and-install-gromacs-2018.sh

    # Install and initialize our virtual environment
    source venv/bin/activate
    
    
    echo ">>> Installing Python deps"
    # Install our project dependencies
    pip3 install -r requirements.txt > /dev/null
    echo ">>> Python deps installed"

    echo ">>> Resetting database"
    # Clear our SQLite DB
    read -p ">>>> Administrator Email: " email
    read -p ">>>> VisualDynamics no-reply Email: " noreplyemail
    read -p ">>>> VisualDynamics no-reply Email password: " noreplyemailpassword
    export VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL=$email
    export VISUAL_DYNAMICS_NO_REPLY_EMAIL=$noreplyemail
    export VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD=$noreplyemailpassword
    
    echo >> ~/.bashrc
    echo "export VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL=$email" >> ~/.bashrc
    echo >> ~/.bashrc
    echo "export VISUAL_DYNAMICS_NO_REPLY_EMAIL=$noreplyemail" >> ~/.bashrc
    echo >> ~/.bashrc
    echo "export VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD=$noreplyemailpassword" >> ~/.bashrc

    source ~/.bashrc
    
    python3 clear_database.py
    echo ">>> Database resetted"

    # Make sure our DB and our md_pr file don't go to VCS
    git update-index --assume-unchanged app/app.db mdpfiles/md_pr.mdp

    # Make our app starters executable
    chmod +x run.sh

    # Compile our app translations
    echo ">>> Readying translations"
    flask translate compile > /dev/null
    echo ">>> Translations ready"
    echo "VisualDynamics is now ready. See './run.sh -h' to start the application"  

elif [ $resp = 'n' ]; then
    echo "Installation Cancelled"

else
    echo "Invalid Option"

fi
