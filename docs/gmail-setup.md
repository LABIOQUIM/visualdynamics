# Sending emails

Visual Dynamics uses three environment variables to store the emails it uses:

1. `VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL`
1. `VISUAL_DYNAMICS_NO_REPLY_EMAIL`
1. `VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD`

The first is used when creating the administrator account and when someone registers to notify the administrator that there's someone waiting to be let in.  
The second and third are credentials used to effectively send emails. Actually only Gmail is available to this option.

# Sending emails with Gmail

When using Gmail as `VISUAL_DYNAMICS_NO_REPLY_EMAIL` you can't use your email and password as login method, instead you must use your email and a App Password, this ensures any thir party service needing access to your Gmail account will not be able to do more than it should.

During `./run -i` the first step is to provide the Administrator email, the No Reply email and Password. It is in this step that you'll require an App Password if you want to use a Gmail account. To create a App Password you can go to your Google Account [App Passwords](https://myaccount.google.com/apppasswords) page, be sure to have selected the correct email account on the top right.

Click on any of the selects (Select app or Select device), and click on `Other`, name it something you can easily identify (as if you delete it later, the application will not be able to send emails anymore), e.g.: noreply@visualdynamics. Click on `Generate` and you'll be presented a 16 characters long randomized password on a orange (yellow?) background. This is your app password.

With it, you can now run `./run -i`, provide any email you want for the Administrator Email, provide the Gmail you want to NO REPLY, and the associated App Password of the NO REPLY email that you just created (remember, no spaces), with this, Visual Dynamics now is able to send emails throught Gmail.
