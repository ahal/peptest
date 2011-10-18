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

from Queue import Empty 
import mozlog
import time
import os

# singleton class
here = os.path.dirname(os.path.realpath(__file__))

class Results(object):
    """
    Singleton class for keeping track of which
    tests are currently running and which 
    tests have failed
    """
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Results, cls).__new__(
                                cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self.currentTest = None
        self.currentAction = None
        self.tracerEvents = []
        self.fails = {}
        self.logfile = open(os.path.join(here, 'peptest.log'), 'w')
        self.logfile.close()
        self.logfile = open(os.path.join(here, 'peptest.log'), 'r')
        self.logger = mozlog.getLogger('PEP')

    def hasFails(self):
        for k, v in self.fails.iteritems():
            if len(v) > 0:
                return True
        return False

    def addTracerEvent(self, timestamp, value):
        self.tracerEvents.append((timestamp, value))

    def compileLog(self, queue):
        line = ""
        while line.find("FINISHED") == -1:
            line = self._readWithTimeout(self.logfile)
            tokens = line.split()
            if len(tokens) == 0:
                continue
            if tokens[0] == 'PEP':
                # test start
                if tokens[1] == 'TEST-START':
                    self.currentTest = tokens[2].rstrip()
                    self.fails[self.currentTest] = []
                    self.logger.testStart(self.currentTest)
                # test end
                elif tokens[1] == 'TEST-END':
                    if len(self.fails[self.currentTest]) == 0:
                        self.logger.testPass(self.currentTest)
                    self.logger.testEnd(self.currentTest +
                                        ' | finished in: ' + tokens[3].rstrip() + ' ms')
                    self.currentTest = None
                # action start
                elif tokens[1] == 'ACTION-START':
                    action = {}
                    action['name'] = tokens[3]
                    action['start_time'] = tokens[4].rstrip()
                    self.currentAction = action
                    self.logger.debug(tokens[1] + ' | ' + self.currentAction['name'])
                # action end
                elif tokens[1] == 'ACTION-END':
                    self.currentAction['end_time'] = tokens[4].rstrip()

                    while not queue.empty():
                        self.tracerEvents.append(queue.get(block=False))

                    # log all the failures that occured during the action
                    for timestamp, value in self.getFailsForAction(self.currentAction):
                        self.logger.testFail(self.currentTest + ' | ' +
                                             self.currentAction['name'] +
                                             ' | unresponsive time: ' + value + ' ms')
                        self.fails[self.currentTest].append(value)
                    self.logger.debug(tokens[1] + ' | ' + self.currentAction['name'])
                    self.currentAction = None
                # error
                elif tokens[1] == 'ERROR':
                    # TODO Don't use lstrip
                    self.logger.error(line.lstrip('PERO ').rstrip())
                else:
                    self.logger.debug(line.lstrip('PE '))

    def getFailsForAction(self, action):
        """
        Accepts an action and returns a list of
        failures that occured during the action
        """
        return [(t, v) for (t, v) in sorted(self.tracerEvents, key=lambda obj: obj[0])
                            if t > action['start_time'] if t < action['end_time']]


    def _readWithTimeout(self, f, timeout=None):
        while True:
            where = f.tell()
            line = f.readline()
            if not line:
                time.sleep(0.1)
                f.seek(where)
            else:
                return line

