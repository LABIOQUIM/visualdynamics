#!bin/bash
read -p ">>>> Administrator Email: " email
read -p ">>>> VisualDynamics no-reply Email: " noreplyemail
read -p ">>>> VisualDynamics no-reply Email password: " noreplyemailpassword

echo "#!bin/bash" >| ./config
echo "export VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL=$email" >> ./config
echo "export VISUAL_DYNAMICS_NO_REPLY_EMAIL=$noreplyemail" >> ./config
echo "export VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD=$noreplyemailpassword" >> ./config
