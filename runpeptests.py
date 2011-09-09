from optparse import OptionParser
from mozprofile import FirefoxProfile
from mozrunner import FirefoxRunner

import os
import sys
import tempfile

class PeptestOptions(OptionParser):
    def __init__(self, **kwargs):
        OptionParser.__init__(self, **kwargs)
        self.add_option("--appname",
                        action = "store", type = "string", dest = "app",
                        help = "absolute path to application, overriding default")
        
        self.add_option("--log-file",
                        action = "store", type = "string", dest = "logFile",
                        metavar = "FILE", default = "",
                        help = "file to which logging occurs")

        self.add_option("--autorun",
                        action = "store_true", dest = "autorun",
                        default = False,
                        help = "start running tests when the application starts")

        self.add_option("--timeout",
                        type = "int", dest = "timeout",
                        default = None,
                        help = "per-test timeout in seconds")

        LOG_LEVELS = ("DEBUG", "INFO", "WARNING", "ERROR", "FATAL")
        LEVEL_STRING = ", ".join(LOG_LEVELS)
        self.add_option("--console-level",
                        action = "store", type = "choice", dest = "consoleLevel",
                        choices = LOG_LEVELS, metavar = "LEVEL",
                        default = None, 
                        help = "one of %s to determine the level of console "
                               "logging" % LEVEL_STRING) 

        self.add_option("--test-path",
                        action = "store", type = "string", dest = "testPath",
                        default = "",
                        help = "start in the given directory's tests")

        self.add_option("--setenv",
                        action = "append", type = "string", dest = "environment",
                        metavar = "NAME=VALUE", default = [],
                        help = "sets the given variable in the application's "
                               "environment")

        self.add_option("--browser-arg",
                        action = "append",  type = "string", dest = "browserArgs",
                        metavar = "ARG", default = [],
                        help = "provides an argument to the test application")

        self.add_option("--leak-threshold",
                        action = "store", type = "int", dest = "leakThreshold",
                        metavar = "THRESHOLD", default = 0,
                        help = "fail if the number of bytes leaked through "
                               "refcounted objects (or bytes in classes with "
                               "MOZ_COUNT_CTOR and MOZ_COUNT_DTOR) is greater "
                               "than the given number")

        self.add_option("--fatal-assertions",
                        action = "store_true", dest = "fatalAssertions",
                        default = False,
                        help = "abort testing whenever an assertion is hit "
                               "(requires a debug build to be effective)")

        self.add_option("--profile-path", action = "store",
                        type = "string", dest = "profilePath",
                        default = tempfile.mkdtemp(),
                        help = "Directory where the profile will be stored. "
                               "This directory will be deleted after the tests are finished")

        usage = """
                Usage instructions for runtests.py.
                %prog [options]
                All arguments are optional.
                """

        self.set_usage(usage)

    def verifyOptions(self, options):
        """ verify correct options and cleanup paths """
        return options 




class Peptest():
    profile = None
    runner = None
    options = {}

    def __init__(self, options, **kwargs):
        self.options = options

    def runTests(self):
        if self.options.testPath and os.path.exists(self.options.testPath):
            if os.path.isdir(self.options.testPath):
                for test in os.listdir(self.options.testPath):
                    self.start(os.path.join(self.options.testPath, test))
            else:
                self.start(self.options.testPath)


    def start(self):
        # ensure we are stopped
        self.stop()

        print testPath
        self.profile = PepProfile(addons=['extension/pep.xpi'])

        cmdargs = []
        cmdargs.extend(self.options.browserArgs)
        cmdargs.append(testPath)

        # run with managed process handler
        self.runner = PepRunner(profile=self.profile,
                                binary=self.options.app,
                                cmdargs=cmdargs)
        self.runner.start()
        self.runner.wait()
    
    def stop(self):
        """Kill the app"""
        if self.runner is not None:
            self.runner.stop()

class PepProfile(FirefoxProfile):
    def __init__(self, profile=None, addons=None):
        Profile.__init__(self, profile=profile, addons=addons, restore=False)

class PepRunner(FirefoxRunner):
    def __init__(self, profile=None, binary=None, cmdargs=None, env=None):
        FirefoxRunner.__init__(profile=profile, binary=binary, cmdargs=cmdargs, env=env)

def main():
    parser = PeptestOptions()
    options, args = parser.parse_args()
    options = parser.verifyOptions(options)
    if options == None:
        sys.exit(1)

    peptest = Peptest(options)
    peptest.start()

if __name__ == '__main__':
    main()
