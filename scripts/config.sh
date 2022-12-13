#!bin/bash
read -p ">>>> Administrator Email: " email
read -p ">>>> VisualDynamics no-reply Email: " noreplyemail
read -s -p ">>>> VisualDynamics no-reply Email password: " noreplyemailpassword

secretkey=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13)

echo "#!bin/bash" >| ./config
echo "export VISUAL_DYNAMICS_SECRET_KEY=$secretkey" >> ./config
echo "export VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL=$email" >> ./config
echo "export VISUAL_DYNAMICS_NO_REPLY_EMAIL=$noreplyemail" >> ./config
echo "export VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD=$noreplyemailpassword" >> ./config
echo