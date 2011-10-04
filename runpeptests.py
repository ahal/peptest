# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1 
# 
# The contents of this file are subject to the Mozilla Public License Version 
# 1.1 (the "License"); you may not use this file except in compliance with 
# the License. You may obtain a copy of the License at 
# http://www.mozilla.org/MPL/ # 
# Software distributed under the License is distributed on an "AS IS" basis, 
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License 
# for the specific language governing rights and limitations under the 
# License. 
# 
# The Original Code is Peptest. 
# 
# The Initial Developer of the Original Code is 
#   Mozilla Corporation. 
# Portions created by the Initial Developer are Copyright (C) 2011
# the Initial Developer. All Rights Reserved. 
# 
# Contributor(s): 
#   Andrew Halberstadt <halbersa@gmail.com>
# 
# Alternatively, the contents of this file may be used under the terms of 
# either the GNU General Public License Version 2 or later (the "GPL"), or 
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"), 
# in which case the provisions of the GPL or the LGPL are applicable instead 
# of those above. If you wish to allow use of your version of this file only 
# under the terms of either the GPL or the LGPL, and not to allow others to 
# use your version of this file under the terms of the MPL, indicate your 
# decision by deleting the provisions above and replace them with the notice 
# and other provisions required by the GPL or the LGPL. If you do not delete 
# the provisions above, a recipient may use your version of this file under 
# the terms of any one of the MPL, the GPL or the LGPL. 
# 
# ***** END LICENSE BLOCK ***** 

from optparse import OptionParser
from mozprofile import FirefoxProfile, ThunderbirdProfile
from mozrunner import FirefoxRunner, ThunderbirdRunner
from manifestparser import TestManifest
from pepserver import PepHTTPServer
from pepprocess import PepProcess

import os
import sys
import signal

class PeptestOptions(OptionParser):
    def __init__(self, **kwargs):
        OptionParser.__init__(self, **kwargs)
        self.add_option("-b", "--binary",
                        action="store", type="string", dest="binary",
                        help="absolute path to application, overriding default")

        self.add_option("--app",
                        action="store", type="string", dest="app",
                        default="firefox",
                        help="app to run the tests on (firefox or thunderbird) "
                             "defaults to firefox")
        
        self.add_option("--log-file",
                        action="store", type="string", dest="logFile",
                        metavar="FILE", default=None,
                        help="file to which logging occurs")

        self.add_option("--autorun",
                        action="store_true", dest="autorun",
                        default=False,
                        help="start running tests when the application starts")

        self.add_option("--timeout",
                        type="int", dest="timeout",
                        default=None,
                        help="per-test timeout in seconds")

        LOG_LEVELS = ("DEBUG", "INFO", "WARNING", "ERROR")
        LEVEL_STRING = ", ".join(LOG_LEVELS)
        self.add_option("--log-level",
                        action="store", type="choice", dest="logLevel",
                        choices=LOG_LEVELS, metavar="LEVEL",
                        default=None, 
                        help="one of %s to determine the level of logging"
                             "logging" % LEVEL_STRING) 

        self.add_option("-t", "--test-path",
                        action="store", type="string", dest="testPath",
                        default="",
                        help="path to the test manifest")

        self.add_option("--setenv",
                        action="append", type="string", dest="environment",
                        metavar="NAME=VALUE", default=[],
                        help="sets the given variable in the application's "
                             "environment")

        self.add_option("--browser-arg",
                        action="append",  type="string", dest="browserArgs",
                        metavar="ARG", default=[],
                        help="provides an argument to the test application")

        self.add_option("--leak-threshold",
                        action="store", type="int", dest="leakThreshold",
                        metavar="THRESHOLD", default=0,
                        help="fail if the number of bytes leaked through "
                             "refcounted objects (or bytes in classes with "
                             "MOZ_COUNT_CTOR and MOZ_COUNT_DTOR) is greater "
                             "than the given number")

        self.add_option("--fatal-assertions",
                        action="store_true", dest="fatalAssertions",
                        default=False,
                        help="abort testing whenever an assertion is hit "
                             "(requires a debug build to be effective)")

        self.add_option("-p", "--profile-path", action="store",
                        type="string", dest="profilePath",
                        default=None,
                        help="Directory where the profile will be stored. "
                             "This directory will be deleted after the tests are finished")

        usage = """
                Usage instructions for runtests.py.
                %prog [options]
                All arguments are optional.
                """

        self.set_usage(usage)

    def verifyOptions(self, options):
        """ verify correct options and cleanup paths """
        # TODO
        return options 

class Peptest():
    profile = None
    runner = None
    manifest = None
    server = None
    child_pid = None
    options = {}

    def __init__(self, options, **kwargs):
        self.options = options

    def start(self):
        # ensure we are stopped
        self.stop()
        
        # Create the profile
        self.profile = FirefoxProfile(profile=self.options.profilePath,
                                  addons=['extension/pep.xpi'])

        # Open and convert the manifest to json
        manifest = TestManifest()
        manifest.read(self.options.testPath)
       
        # Setup environment
        env = os.environ.copy()
        env['MOZ_INSTRUMENT_EVENT_LOOP'] = '1'

        # Create a manifest object to be read by the JS side
        manifestObj = {}
        manifestObj['tests'] = manifest.get()
        
        # Write manifest to a JSON file 
        jsonManifest = open('manifest.json', 'w')
        jsonManifest.write(str(manifestObj).replace("'", "\""))
        jsonManifest.close()

        # Construct the browser arguments
        cmdargs = []
        # TODO Make browserArgs a list
        cmdargs.extend(self.options.browserArgs)
        cmdargs.extend(['-pep-start', os.path.realpath(jsonManifest.name)])
        cmdargs.append('-pep-noisy')
        
        # Fork a server to serve the tests
        self.runServer()

        # run with managed process handler
        self.runner = FirefoxRunner(profile=self.profile,
                                binary=self.options.binary,
                                cmdargs=cmdargs,
                                env=env,
                                process_class=PepProcess)
        self.runner.start()
        self.runner.wait()

    def runServer(self):
        pId = os.fork()
        # if child process
        if pId == 0:
            os.chdir(os.path.dirname(self.options.testPath))
            self.server = PepHTTPServer(8080)
            print "Starting server on port 8080"
            self.server.serve_forever()
        else:
            self.child_pid = pId
    
    def stop(self):
        """Kill the app"""
        if self.runner is not None:
            self.runner.stop()

        if self.child_pid is not None:
            print "child_process: " + str(self.child_pid)
            os.kill(self.child_pid, signal.SIGKILL)

class FirefoxPeptest(Peptest):
    profile_class = FirefoxProfile
    runner_class = FirefoxRunner

class ThunderbirdPeptest(Peptest):
    profile_class = ThunderbirdProfile
    runner_class = ThunderbirdRunner

applications = {'firefox': FirefoxPeptest,
                'thunderbird': ThunderbirdPeptest}

def main():
    parser = PeptestOptions()
    options, args = parser.parse_args()
    options = parser.verifyOptions(options)
    if options == None:
        return 1

    peptest = applications[options.app](options)
    peptest.start()
    peptest.stop()

if __name__ == '__main__':
    sys.exit(main())
