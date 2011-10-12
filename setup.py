import os
from setuptools import setup, find_packages

try:
    here = os.path.dirname(os.path.abspath(__file__))
    description = file(os.path.join(here, 'README.md')).read()
except IOError: 
    description = ''

version = "0.0"

dependencies = ['mozprofile', 'mozprocess', 'mozrunner', 'mozlog']

setup(name='peptest',
      version=version,
      description="Peptest is an automated testing framework designed to test whether or not the browser's UI thread remains responsive while performing a variety of actions. Tests are simple Javascript files which can optionally import Mozmill's driver to manipulate the user interface in an automated fashion.",
      long_description=description,
      classifiers=[], # Get strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      author='Andrew Halberstadt',
      author_email='ahalberstadt@mozilla.com',
      url='https://wiki.mozilla.org/Auto-tools/Projects/peptest',
      license='MPL',
      packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
      include_package_data=True,
      package_data={'': ['*.js', '*.css', '*.html', '*.txt', '*.xpi', '*.rdf', '*.xul', '*.jsm', '*.xml'],},
      zip_safe=False,
      install_requires=dependencies,
      entry_points="""
      # -*- Entry points: -*-
      [console_scripts]
      peptest = peptest.runpeptests:main
      """,
      )
