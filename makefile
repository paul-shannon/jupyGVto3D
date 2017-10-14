build:
	(cd ./js; npm update)
	(cd ./js; webpack --config webpack.config.js)
	pip install -e .
	(cd ./js; npm install)
	jupyter nbextension install --user --py jupyGVto3D
	jupyter nbextension enable --user --py --sys-prefix jupyGVto3D

clean:
	- rm -rf js/node_modules/*
	- rm -rf js/dist/*
	- rm -rf jupyGVto3D/static/*
	- rm -rf jupyGVto3D/__pycache__


run:
	(cd ./examples/basicDemo; jupyter notebook simple.ipynb)
