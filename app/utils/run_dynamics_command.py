import shlex
import os
import subprocess
from flask_login import current_user
from app.config import Config

def run_dynamics_command(command, log_file):
    # Split the command into a list of arguments using shlex
    args = shlex.split(command)
    
    should_use_shell = '>' in command

    # Use the `with` statement to open the log file
    with open(log_file, 'a') as f:
        # Check if the command contains a pipe
        if '|' in command:
            # Split the command at the pipe character
            cmd1, cmd2 = command.split('|', 1)

            # Split the first command into a list of arguments using shlex
            args1 = shlex.split(cmd1)
            
            # Split the second command into a list of arguments using shlex
            args2 = shlex.split(cmd2)
            
            # Create the first subprocess using `Popen`
            process1 = subprocess.Popen(args1, stdout=subprocess.PIPE, stderr=f)
            
            # Create the second subprocess using `Popen` and connect the stdout and stderr to the log file
            process2 = subprocess.Popen(cmd2 if should_use_shell else args2, shell=should_use_shell, stdin=process1.stdout, stdout=f, stderr=f, preexec_fn=os.setsid)
            
            with open(os.path.join(Config.UPLOAD_FOLDER, current_user.username, "pid"), "w") as f:
                f.write(f"{process2.pid}")

            # Wait for the processes to complete
            process1.wait()
            process2.wait()
            
            # Return the output of the second subprocess as a tuple
            return (process2.pid, process2.returncode)
        else:
            # Run the command using `run` and redirect stdout and stderr to the log file
            process = subprocess.Popen(command if should_use_shell else args, shell=should_use_shell, stdout=f, stderr=f, preexec_fn=os.setsid)
            
            with open(os.path.join(Config.UPLOAD_FOLDER, current_user.username, "pid"), "w") as f:
                f.write(f"{process.pid}")
            
            process.wait()
            
            # Return the output of the command as a tuple
            return (process.pid, process.returncode)
