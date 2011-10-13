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

from mozprocess import ProcessHandler
from pepresults import Results
from datetime import datetime, timedelta
import mozlog
import mozinfo
import subprocess
import time
import os

results = Results()

class PepProcess(ProcessHandler):
    """
    Process handler for running peptests
    """
    def __init__(self, cmd,
                       args=None, cwd=None,
                       env=os.environ.copy(),
                       ignore_children=False,
                       **kwargs):

        ProcessHandler.__init__(self, cmd, args=args, cwd=cwd, env=env,
                                ignore_children=ignore_children, **kwargs)
        
        self.logger = mozlog.getLogger('PEP')
            
    def processOutputLine(self, line):
        """
        Callback called on each line of output
        Responsible for determining which output lines are relevant
        and writing them to a log
        """
        tokens = line.split(' ')
        # message generated from PEP harness
        if tokens[0] == 'PEP':
            # test start
            if tokens[1] == 'TEST-START':
                results.currentTest = tokens[2].rstrip()
                results.fails[results.currentTest] = []
                self.logger.testStart(results.currentTest)
            # test end
            elif tokens[1] == 'TEST-END':
                # if no failures occured, log TEST-PASS
                if len(results.fails[results.currentTest]) == 0:
                    self.logger.testPass(results.currentTest)
                self.logger.testEnd(results.currentTest +
                                    ' | finished in: ' + tokens[3].rstrip() + ' ms')
                results.currentTest = None
            # action start
            elif tokens[1] == 'ACTION-START':
                action = {}
                action['name'] = tokens[3]
                action['start_time'] = tokens[4].rstrip()
                results.currentAction = action
                self.logger.debug(tokens[1] + ' | ' + results.currentAction['name'])
            # action end
            elif tokens[1] == 'ACTION-END':
                results.currentAction['end_time'] = tokens[4].rstrip()
                # log all the failures tha occured during the action
                for timestamp, value in results.getFailsForAction(results.currentAction):
                    self.logger.testFail(results.currentTest + ' | ' +
                                         results.currentAction['name'] +
                                         ' | unresponsive time: ' + value + ' ms')
                    results.fails[results.currentTest].append(value)
                self.logger.debug(tokens[1] + ' | ' + results.currentAction['name'])
                results.currentAction = None
            # error
            elif tokens[1] == 'ERROR':
                # TODO Don't use lstrip
                self.logger.error(line.lstrip('PERO ').rstrip())
            else:
                self.logger.debug(line.lstrip('PE '))

        # message generated from event tracer
        elif tokens[0] == 'MOZ_EVENT_TRACE' and tokens[1] == 'sample':
            results.events.append((tokens[2], tokens[3].rstrip()))

    if mozinfo.isWin:
        # a separate way of dealing with output in windows is needed
        # https://bugzilla.mozilla.org/show_bug.cgi?id=693625
        
        # needed to print gibberish to stdout to prevent buildbot from killing us
        def waitForFinish(self, timeout=None, outputTimeout=None):
            """
            Handle process output until the process terminates or times out.
            
            If timeout is not None, the process will be allowed to continue for
            that number of seconds before being killed.
           
            If outputTimeout is not None, the process will be allowed to continue
            for that number of seconds without producing any output before
            being killed.
            """

            if not hasattr(self, 'proc'):
                self.run()
            
            self.didTimeout = False
            logsource = self.proc.stdout

            lineReadTimeout = None
            if timeout:
                lineReadTimeout = timeout - (datetime.now() - self.startTime).seconds
            elif outputTimeout:
                lineReadTimeout = outputTimeout

            (line, self.didTimeout) = self.readWithTimeout(logsource, lineReadTimeout)
            while line != "" and not self.didTimeout:
                self.processOutputLine(line.rstrip())
                if timeout:
                    lineReadTimeout = timeout - (datetime.now() - self.startTime).seconds
                (line, self.didTimeout) = self.readWithTimeout(logsource, lineReadTimeout)


            if self.didTimeout:
                self.proc.kill()
                self.onTimeout()
            else:
                self.onFinish()

            status = self.proc.wait()
            return status
