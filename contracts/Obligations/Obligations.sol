// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "../Indexing/Indexing.sol";
import "../Libraries/Ownable.sol";

/*
The smart contract represents and stores obligations rules related to pods and resources.
The architecture of the market supposes that each initialized pod is owner of a 
*/
contract Obligations is Ownable {

    Indexing private _indexing;
    ObligationRules private _defaultPodObligation;

    mapping(int => ObligationRules) resourcesObligation;
    modifier hasSpecificRules(int resourceId) {
        require(
            withSpecificRules(resourceId),
            "The resource has not specific obligaitons rules. Add specific rules, or changhe the default pod rules."
        );
        _;
    }

    constructor(address indexing, address podAddress) {
        _indexing = Indexing(indexing);
        transferOwnership(podAddress);
    }

    /*
    Modifier that checks if the temporal obligation value is valid.
    */
    modifier isValidTemporal(uint deadline) {
        uint d = 1 days;
        require(deadline > d, "The temporal obligation must be at least 1 day");
        _;
    }

    /*
    Modifier that verifier if the given resource id is contained in the pod associated with the smart contract instance.
    */
    modifier isTheResourceCovered(int idResource) {
        Indexing.Resource memory resource = _indexing.getResource(idResource);
        require(
            resource.owner == owner(),
            "The resource is not covered by this contract"
        );
        _;
    }

    /*
    Function that returns the obligation rules associated with the resource of the given identifier.
    */
    function getObligationRules(
        int idResource
    )
        public
        view
        isTheResourceCovered(idResource)
        returns (ObligationRules memory)
    {
        if (resourcesObligation[idResource].exists) {
            return resourcesObligation[idResource];
        }
        return _defaultPodObligation;
    }

    /*
    Function that returns the default ObligationRules object associated with the pod.
    */
    function getDefaultObligationRules()
        public
        view
        returns (ObligationRules memory)
    {
        return _defaultPodObligation;
    }

    /*
    Function to set a default Access Counter obligation associated with the pod.
    */
    function addDefaultAccessCounterObligation(uint accessCounter) public {
        _defaultPodObligation.acObligation.exists = true;
        _defaultPodObligation.acObligation.accessCounter = accessCounter;
    }

    /*
    Function that sets a default Temporal obligation associated with the pod.
    */
    function addDefaultTemporalObligation(
        uint temporalObligation
    ) public isValidTemporal(temporalObligation) onlyOwner {
        uint d = 1 days;
        require(
            temporalObligation > d,
            "The temporal obligation must be at least 1 day"
        );
        _defaultPodObligation.temporalObligation.exists = true;
        _defaultPodObligation
            .temporalObligation
            .usageDuration = temporalObligation;
    }

    /*
    Function to set a default Domain obligation associated with the pod.
    */
    function adDefaultDomainObligation(DomainType domain) public onlyOwner {
        _defaultPodObligation.domainObligation.exists = true;
        _defaultPodObligation.domainObligation.domain = domain;
    }

    /*
    Adds an Access Counter obligation for the given resource.
    */
    function addAccessCounterObligation(
        int idResource,
        uint accessCounter
    )
        public
        isTheResourceCovered(idResource)
        onlyOwner
        returns (ObligationRules memory)
    {
        if (resourcesObligation[idResource].exists) {
            resourcesObligation[idResource]
                .acObligation = AccessCounterObligation(accessCounter, true);
        } else {
            resourcesObligation[idResource].exists = true;
            resourcesObligation[idResource].idResource = idResource;
            resourcesObligation[idResource]
                .acObligation = AccessCounterObligation(accessCounter, true);
        }
        return resourcesObligation[idResource];
    }

    /*
    Adds a Domain obligation for the given resource.
    */
    function addDomainObligation(
        int idResource,
        DomainType domain
    )
        public
        onlyOwner
        isTheResourceCovered(idResource)
        returns (ObligationRules memory)
    {
        if (resourcesObligation[idResource].exists) {
            resourcesObligation[idResource].domainObligation = DomainObligation(
                domain,
                true
            );
        } else {
            resourcesObligation[idResource].exists = true;
            resourcesObligation[idResource].idResource = idResource;
            resourcesObligation[idResource].domainObligation = DomainObligation(
                domain,
                true
            );
        }
        return resourcesObligation[idResource];
    }

    /*
    Adds a Temporal obligation for the given resource.
    */
    function addTemporalObligation(
        int idResource,
        uint deadline
    )
        public
        onlyOwner
        isTheResourceCovered(idResource)
        isValidTemporal(deadline)
        returns (ObligationRules memory)
    {
        if (resourcesObligation[idResource].exists) {
            resourcesObligation[idResource]
                .temporalObligation = TemporalObligation(deadline, true);
        } else {
            resourcesObligation[idResource].exists = true;
            resourcesObligation[idResource].idResource = idResource;
            resourcesObligation[idResource]
                .temporalObligation = TemporalObligation(deadline, true);
        }
        return resourcesObligation[idResource];
    }

    /*
    Deactivates an Access Counter obligation for the given resource.
    */
    function removeAccessCounterObligation(
        int idResource
    )
        public
        onlyOwner
        isTheResourceCovered(idResource)
        hasSpecificRules(idResource)
    {
        resourcesObligation[idResource].acObligation.exists = false;
        resourcesObligation[idResource].acObligation.accessCounter = 0;
    }

    /*
    Deactivates a Temporal obligation for the given resource.
    */
    function removeTemporalObligation(
        int idResource
    )
        public
        isTheResourceCovered(idResource)
        onlyOwner
        hasSpecificRules(idResource)
    {
        resourcesObligation[idResource].temporalObligation.exists = false;
        resourcesObligation[idResource].temporalObligation.usageDuration = 0;
    }

    /*
    Deactivates a Domain obligation for the given resource.
    */
    function removeDomainObligation(
        int idResource
    )
        public
        isTheResourceCovered(idResource)
        onlyOwner
        hasSpecificRules(idResource)
    {
        resourcesObligation[idResource].domainObligation.exists = false;
        resourcesObligation[idResource].domainObligation.domain = DomainType
            .NULL;
    }

    /*
    Deactivates a default AccessCounter obligation associated with the pod.
    */
    function removeDefaultAccessCounterObligation() public onlyOwner {
        _defaultPodObligation.acObligation.exists = false;
        _defaultPodObligation.acObligation.accessCounter = 0;
    }

    /*
    Deactivates a Temporal obligation associated with the pod.
    */
    function removeDefaultTemporalObligation() public onlyOwner {
        _defaultPodObligation.temporalObligation.exists = false;
        _defaultPodObligation.temporalObligation.usageDuration = 0;
    }

    /*
    Deactivates a default Domain obligation associated with the pod.
    */
    function removeDefaultDomainObligation() public onlyOwner {
        _defaultPodObligation.domainObligation.exists = false;
        _defaultPodObligation.domainObligation.domain = DomainType.NULL;
    }

    /*
    Cheks if a given resource has specific obligation rules or inherits the default's pod rules.
    */
    function withSpecificRules(int idResource) public view returns (bool) {
        return resourcesObligation[idResource].exists;
    }

    struct ObligationRules {
        int idResource;
        AccessCounterObligation acObligation;
        TemporalObligation temporalObligation;
        DomainObligation domainObligation;
        bool exists;
    }

    struct AccessCounterObligation {
        uint accessCounter;
        bool exists;
    }

    struct TemporalObligation {
        // TEE lifetime in unix
        uint usageDuration;
        bool exists;
    }

    struct DomainObligation {
        DomainType domain;
        bool exists;
    }

    enum DomainType {
        NULL,
        SIGNATURE_BASE
    }
}
