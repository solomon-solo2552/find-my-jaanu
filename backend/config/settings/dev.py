from .base import * #noqa
import warnings

DEBUG =True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
warnings.filterwarnings("ignore", category=DeprecationWarning, module="daphne")