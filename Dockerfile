FROM python:3.7.1
RUN apt-get update -y && \
    apt-get install -y build-essential cmake wget
#baixar e instalar gromacs
RUN wget ftp://ftp.gromacs.org/pub/gromacs/gromacs-2018.3.tar.gz
RUN tar -zxvf gromacs-2018.3.tar.gz
RUN cd gromacs-2018.3
RUN mkdir build
RUN cd build
WORKDIR /gromacs-2018.3/build
RUN cmake .. -DGMX_BUILD_OWN_FFTW=ON -DGMX_DOUBLE=on
RUN make
RUN make install
RUN cd ../..
RUN ["/bin/bash","-c","source /usr/local/gromacs/bin/GMXRC"]
# preparando aplicacao
RUN mkdir /visualdynamics
COPY . /visualdynamics
WORKDIR /visualdynamics
# RUN python3 -m venv env/
RUN pip install pip --upgrade
# One important step that may seem out of place is that I copy in the Python requirements.txt 
# file and install the Python requirements early on in the Dockerfile build process. 
# Installing the Python requirements is a time-consuming process, and I can leverage Docker's 
# build-in caching feature to ensure that Docker only needs to install the requirements if a 
# change is specifically made to the requirements file. If I were push that step further down 
# in the Dockerfile, I'd risk unnecessarily re-installing the Python requirements every time 
# I make an arbitrary change to the code.
COPY ./requirements.txt requirements.txt
RUN pip install -r requirements.txt

#flask good practices
ENV FLASK_ENV="production"
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]