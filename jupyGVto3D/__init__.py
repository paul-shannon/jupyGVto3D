from ._version import version_info, __version__

from .GVto3D import *

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'jupyGVto3D',
        'require': 'jupyGVto3D/extension'
    }]
