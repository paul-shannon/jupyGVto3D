FROM jupyter/base-notebook
USER root
RUN apt-get update
RUN apt-get install git -y
RUN apt-get install nodejs -y
RUN npm install -g webpack -y
WORKDIR /home/jovyan
ADD . /home/jovyan

RUN (cd ./js; npm update)
RUN (cd ./js; webpack --config webpack.config.js)
RUN pip install -e .
RUN (cd ./js; npm install)
RUN jupyter nbextension install --user --py jupyGVto3D
RUN jupyter nbextension enable --user --py --sys-prefix jupyGVto3D
USER jovyan
