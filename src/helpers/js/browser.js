/**
 * @typedef {Object} BrowserInfo
 * @property {string} name    The name of the current browser.
 * @property {string} version The version number/string of the current browser.
 */

var Browser;

( function () {

    /**
     * Provides current browser information, as well as utilities to check if version or browser requirements are met.
     */
    function browser() {

        var func                  = this;

        func.name                 = '';
        func.version              = '';
        // Current list of supported browsers. Please add some if needed.
        func.supported            = {
            firefox: [ 45 ],
            chrome:  [ 50 ],
            safari:  [ 8  ],
            ie:      [ 10 ],
            edge:    [ 12 ]
        };

        func.initialize           = initialize;
        func.supports             = supports;
        func.lessThan             = lessThan;
        func.lessThanOrEqualTo    = lessThanOrEqualTo;
        func.greaterThan          = greaterThan;
        func.greaterThanOrEqualTo = greaterThanOrEqualTo;
        func.equalTo              = equalTo;
        func.is                   = is;
        func.info                 = info;

        /**
         * Initialize the browser object. Attempts to determine the version and name of the browser.
         */
        function initialize() {

            /**
             * @source http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
             */
            var subResultsArray;
            var done         = false;
            var resultsArray =
                    navigator.userAgent.match( /(edge|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d.]+)/i )
                    || [];

            if ( /trident/i.test( resultsArray[ 1 ] ) ) {

                subResultsArray = /\brv[ :]+([\d.]+)/g.exec( navigator.userAgent ) || [];
                func.name       = 'ie';
                func.version    = subResultsArray[ 1 ] || '0';

                done = true;

            } else if ( resultsArray[ 1 ] === 'Chrome' ) {

                subResultsArray = navigator.userAgent.match( /\b(OPR|Edge)\/([\d.]+)/ );

                if ( subResultsArray !== null ) {

                    func.name    = subResultsArray[ 1 ];
                    func.version = subResultsArray[ 2 ] || '0';

                    done = true;
                } else {

                    func.name = 'chrome';
                }
            }

            if ( !done ) {

                resultsArray = resultsArray[ 2 ]
                        ? [ resultsArray[ 1 ], resultsArray[ 2 ] ]
                        : [ navigator.appName, navigator.appVersion, '-?' ];

                if ( ( subResultsArray = navigator.userAgent.match( /version\/([\d.]+)/i ) ) !== null ) {

                    func.version = subResultsArray[ 1 ];
                } else {

                    func.version = resultsArray[ 1 ];
                }

                func.name = resultsArray[ 0 ];
            }

            func.name    = func.name.toLowerCase();
            func.version = func.version.split( '.' );

            for ( var i = 0; i < func.version.length; i++ ) {

                func.version[ i ] = parseInt( func.version[ i ] );
            }
        }

        /**
         * Checks to see if the specified browser and version are supported.
         *
         * @param  {string}  browser The name of the browser.
         * @param  {string}  version The version number of the browser.
         * @return {boolean}         True if the browser is supported, false if not.
         */
        function supports( browser, version ) {

            // Don't remove these parentheses... "return" won't return anything without them (JavaScript assumes the end
            // of the statement before getting to the next line, as semicolons are optional).
            return (
                func.supported[ browser.toLowerCase() ] !== undefined
                && _compare( func.supported[ browser.toLowerCase() ], version.split( '.' ) ) < 1
            );
        }

        /**
         * Checks to see if the current browser version is less than the requested version.
         *
         * @param  {string}  version The version number to compare with the current browser version.
         * @return {boolean}         True if the current browser's version is less than that requested. False otherwise.
         */
        function lessThan( version ) {

            return _compare( func.version, version.split( '.' ) ) === -1;
        }

        /**
         * Checks to see if the current browser version is less than or equal to the requested version.
         *
         * @param  {string}  version The version number to compare with the current browser version.
         * @return {boolean}         True if the current browser's version is less than or equal to that requested. 
         *                           False otherwise.
         */
        function lessThanOrEqualTo( version ) {

            return _compare( func.version, version.split( '.' ) ) < 1;
        }

        /**
         * Checks to see if the current browser version is greater than the requested version.
         *
         * @param  {string}  version The version number to compare with the current browser version.
         * @return {boolean}         True if the current browser's version is greater than that requested. False
         *                           otherwise.
         */
        function greaterThan( version ) {

            return _compare( func.version, version.split( '.' ) ) === 1;
        }

        /**
         * Checks to see if the current browser version is greater than or equal to the requested version.
         *
         * @param  {string}  version The version number to compare with the current browser version.
         * @return {boolean}         True if the current browser's version is greater than or equal to that requested. 
         *                           False otherwise.
         */
        function greaterThanOrEqualTo( version ) {

            return _compare( func.version, version.split( '.' ) ) > -1;
        }

        /**
         * Checks to see if the current browser version is equal to the requested version.
         *
         * @param  {string}  version The version number to compare with the current browser version.
         * @return {boolean}         True if the current browser's version is equal to that requested. False otherwise.
         */
        function equalTo( version ) {

            return _compare( func.version, version.split( '.' ) ) === 0;
        }

        /**
         * Checks to see if the browser is the same name as that requested.
         *
         * @param  {string}  browser The name of the browser requested.
         * @return {boolean}         True if the browser has the same name as the requested name. False otherwise.
         */
        function is( browser ) {

            return func.name === browser.toLowerCase();
        }

        /**
         * Returns information on the current browser.
         *
         * @return {BrowserInfo} The object containing the current browser information.
         */
        function info() {

            return {
                name:    func.name,
                version: func.version.join( '.' )
            };
        }

        /**
         * Compares two version arrays.
         *
         * @param  {string} version1 The first version to compare.
         * @param  {string} version2 The second version to compare.
         * @return {number}          -1 if the first version is less than the second version. 0 if both versions are 
         *                           equal. 1 if the first version is greater than the second version.
         */
        function _compare( version1, version2 ) {

            var result       = 0;

            $.each( version2, function ( index, value ) {

                if ( parseInt( value ) < parseInt( version1[ index ] ) ) {

                    result = 1;
                    return false;
                }
                if ( parseInt( value ) > parseInt( version1[ index ] ) ) {

                    result = -1;
                    return false;
                }
            } );

            if ( result === 0 ) {

                if ( version2.length < version1.length ) {

                    result = 1;
                }
                if ( version2.length > version1.length ) {

                    result = -1;
                }
            }

            return result;
        }
        func.initialize();
    }

    Browser = new browser();
} )();