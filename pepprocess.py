from mozprocess import ProcessHandler
import mozlog
import os

class PepProcess(ProcessHandler):
    """
    Process handler for running peptests
    """
    def __init__(self, cmd,
                       args=None, cwd=None,
                       env=os.environ.copy(),
                       ignore_children=False,
                       peplog=None, **kwargs):

        ProcessHandler.__init__(self, cmd, args=args, cwd=cwd, env=env,
                                ignore_children=ignore_children, **kwargs)
        
        self.currentTest = None
        self.currentAction = None 
        self.testPass = True
        self.logger = mozlog.getLogger('PEP', logfile=peplog)

    def processOutputLine(self, line):
        """
        Callback called on each line of output
        Responsible for determining which output lines are relevant
        and writing them to a log
        """
        # TODO
        tokens = line.split(' ')
        if tokens[0] == 'PEP':
            if tokens[1] == 'TEST-START':
                self.currentTest = tokens[2].rstrip()
                self.testPass = True
                self.logger.testStart(self.currentTest)
            elif tokens[1] == 'TEST-END':
                if self.testPass:
                    self.logger.testPass(self.currentTest)
                else:
                    self.logger.testFail(self.currentTest)
                self.currentTest = None
            elif tokens[1] == 'ACTION-START':
                self.currentAction = tokens[3].rstrip() 
            elif tokens[1] == 'ACTION-END':
                self.currentAction = None
        elif tokens[0] == 'MOZ_EVENT_TRACE' and self.currentAction is not None:
            self.logger.error(self.currentTest + ' | ' + self.currentAction + ' | ' + tokens[3].rstrip() + 'msec')
            self.testPass = False
