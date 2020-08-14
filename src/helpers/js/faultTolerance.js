/**
 * An object that keeps track of a fault tolerance state. If incremented past the max tolerance, it is considered
 * tripped, and the error should no longer be ignored.
 * 
 * @returns {FaultTolerance} A fault tolerance object.
 */
function FaultTolerance() {

    var func       = this;

    func.min       = 0;
    func.max       = 2;
    func.count     = func.min;

    func.increment = increment;
    func.reset     = reset;
    func.tripped   = tripped;
    
    /**
     * Inrement the fault counter by 1.
     */
    function increment() {
        
        func.count++;
    }

    /**
     * Reset the fault counter to 0.
     */
    function reset() {
        
        func.count = func.min;
    }

    /**
     * Returns the current state of the fault tolerance.
     * 
     * @returns {boolean} Will return "true" if enough faults have occurred. Will return "false" otherwise.
     */
    function tripped() {
        
        return func.count >= func.max;
    }
}