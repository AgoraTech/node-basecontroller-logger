BaseController Logger
=======================

A simple logger used by BaseController

Usage
-------

    var logger = require('basecontroller-logger').getInstance('MyLogger');
    
    logger
        .file('somefile.log')
        .level(6);
        
    logger.error('aaa') // logs at level 1.
    logger.warn('aaa')  // logs at level 2.
    logger.log('aaa')   // logs at level 3.
    logger.info('aaa')  // logs at level 4.
    logger.debug('aaa', inspect)
                        // logs at level 5 and inspects all arguments
    logger.trace('aaa')
                        // logs at level 6 and shows stack trace

License
---------

BaseController is released on the BSD 2-clause license. The product is not suitable for consumer use.

You can get the license in "license.txt" file available in this repository.
