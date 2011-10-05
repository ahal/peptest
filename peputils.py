import urllib2
import urlparse
import os
import zipfile
import tarfile

def download(url, savepath=None):
    """
    Save the file located at 'url' into 'savepath'
    If savepath is None, use the last part of the url path.
    Returns the path of the saved file.
    """
    data = urllib2.urlopen(url)
    if savepath is None:
        parsed = urlparse.urlsplit(url)
        savepath = parsed.path[parsed.path.rfind('/')+1:]
    savedir = os.path.dirname(savepath)
    if savedir and not os.path.exists(savedir):
        os.makedirs(savedir)
    outfile = open(savepath, 'wb')
    outfile.write(data.read())
    outfile.close()
    return os.path.realpath(savepath)

def isURL(path):
    """Return True if path looks like a URL."""
    if path is not None:
        return urlparse.urlparse(path).scheme != ''
    return False

def extract(path, savedir=None, delete=False):
    """
    Takes in a tar or zip file and extracts it to savedir
    If savedir is not specified, extracts to path
    If delete is set to True, deletes the bundle at path
    """
    if path.endswith('.zip'):
        bundle = zipfile.ZipFile(path)
    elif path.endswith('.tar.gz') or path.endswith('.tar.bz2'):
        bundle = tarfile.open(path)
    else:
        return
    if savedir is None:
        savedir = os.path.dirname(path)
    elif not os.path.exists(savedir):
        os.makedirs(savedir)
    bundle.extractall(path=savedir)
    bundle.close()
    if delete:
        os.remove(path)
