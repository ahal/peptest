[Peptest](https://wiki.mozilla.org/Auto-tools/Projects/peptest) 
is a Mozilla automated testing harness for running responsiveness tests.
These tests measure how long events spend away from the event loop.

# Running Tests

Currently tests are run from the command line with python. 
Peptest currently depends on some external Mozilla python packages, namely: 
mozrunner, mozprocess, mozprofile, mozinfo, mozlog and manifestdestiny. 
These packages are in the process of being consolidated into one location 
but currently live in three different locations.

- Clone the mozmill, mozbase and manifestdestiny repositories at github.com/mozautomation/mozmill , github.com/mozilla/mozbase and hg.mozilla.org/automation/ManifestDestiny/ respectively. Alternatively many of these packages live on pypi and can be installed via the normal easy_install or pip method.
- Create a new virtualenv and install the mozrunner, mozprofile, mozprocess, mozinfo, mozlog and manifestdestiny packages into it (run 'python setup.py install' for each).
- Clone the Peptest repo at github.com/ahal/peptest
- Run the command (use --help for a full list of commands)

        python runpeptests.py --binary <path_to_binary> --profile-path <path_to_profile> --test-path <path_to_test_manifest> --log-file <path_to_logfile>


