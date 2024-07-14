// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "../Tokenization/Subscription.sol";
import "../Obligations/Obligations.sol";

/*
  The smart contract is part of the Indexing module. The smart contract contains the logic to manage pods and resources'
  metadata. Dara owners and pod managers interact with the DTindexing in order to initialize/deactivate resources.
  Metadata collected in DTindexing are used to coordinate processes in DecentralTrading market.
  Data Consumers interact with the smart contract to retrieve information regarding pods and resources.
  */

contract Indexing {
    int private _podsCounter = 0;
    int private _resourceCounter = 0;

    Subscription private _subscription;
    Pod[] private _podList;
    Resource[] private _resourceList;

    /*
  Modifier that checks if the given identifier is valid, related to an active pod. Finally it's checked if the sender
  of the msg is signed with the pod's credentials.
  */
    modifier validPodId(uint id, address owner) {
        require(id < _podList.length, "The given id is unknown");
        Pod memory pod = _podList[id];
        require(pod.isActive == true, "The pod is not active");
        require(pod.podAddress == owner, "The sender is not the pod");
        _;
    }
    /*
  Modifier that checks if the given resource id is valid and if it is related to an active resource.
  */
    modifier validResourceId(uint id) {
        require(id < _resourceList.length, "The given id is unknown");
        Resource memory resource = _resourceList[id];
        require(resource.isActive == true, "The resource is not active");
        _;
    }
    /*
  Enum that represents the content of a pod.
  */
    enum PodType {
        FINANCIAL,
        SOCIAL,
        MEDICAL
    }

    /*
  Search functions for Medical pods.
  */
    function getMedicalPods() public view returns (Pod[] memory) {
        return searchByType(PodType.MEDICAL);
    }

    /*
  Search functions for Social pods.
  */
    function getSocialPods() public view returns (Pod[] memory) {
        return searchByType(PodType.SOCIAL);
    }

    /*
  Search functions for Financial pods.
  */
    function getFinancialPods() public view returns (Pod[] memory) {
        return searchByType(PodType.FINANCIAL);
    }

    /*
  Function used to initialize new pods in DecentralTrading. It rquire the WEB reference of the pod service and the 
  pod's credentials.
  */
    function registerPod(
        bytes memory newReference,
        PodType podType,
        address podAddress
    ) public returns (int) {
        int idPod = _podsCounter;
        _podList.push(
            Pod(
                _podsCounter,
                podType,
                msg.sender,
                podAddress,
                newReference,
                true
            )
        );
        Obligations obligation = new Obligations(address(this), podAddress);
        emit NewPod(_podsCounter, address(obligation));
        _podsCounter += 1;
        return idPod;
    }

    /*
  Private method used by the search functions.
  */
    function searchByType(PodType tp) private view returns (Pod[] memory) {
        uint resultCount = 0;
        for (uint i = 0; i < _podList.length; i++) {
            if (_podList[i].podType == tp) {
                resultCount++;
            }
        }
        uint j;
        Pod[] memory result = new Pod[](resultCount);
        for (uint i = 0; i < _podList.length; i++) {
            if (_podList[i].podType == tp) {
                result[j] = _podList[i];
                j++;
            }
        }
        return result;
    }

    /*
  Get the information of the resources stored into the given pod identifier.
  */
    function getPodResources(
        int pod_id
    ) public view returns (Resource[] memory) {
        uint resultCount = 0;
        for (uint i = 0; i < _resourceList.length; i++) {
            if (_resourceList[i].podId == pod_id && _resourceList[i].isActive) {
                resultCount++;
            }
        }
        uint j;
        Resource[] memory result = new Resource[](resultCount);
        for (uint i = 0; i < _resourceList.length; i++) {
            if (_resourceList[i].podId == pod_id && _resourceList[i].isActive) {
                result[j] = _resourceList[i];
                j++;
            }
        }
        return result;
    }

    /*
  Function used to initialize new resources in the given pod id. The newReference parameter is the WEB reference of the resource.
  */
    function registerResource(
        int podId,
        bytes memory newReference
    ) public validPodId(uint(podId), msg.sender) returns (int) {
        int idResource = _resourceCounter;
        _resourceList.push(
            Resource(_resourceCounter, msg.sender, newReference, podId, true)
        );
        emit NewResource(_resourceCounter);
        _resourceCounter += 1;
        return idResource;
    }

    /*
  Function that takes as input a resource id and returns the related metadata.
  */
    function getResource(
        int idResource
    ) public view validResourceId(uint(idResource)) returns (Resource memory) {
        return _resourceList[uint(idResource)];
    }

    /*
  Function used to remove resources from DecentralTrading.
  */
    function deactivateResource(
        int idResource
    ) public validResourceId(uint(idResource)) {
        _resourceList[uint(idResource)].isActive = false;
    }

    event NewResource(int idResource);
    event NewPod(int idPod, address obligationAddress);

    // Struct representing pods' metadata.

    struct Pod {
        int id;
        PodType podType;
        address owner;
        // Credentials associated with the Pod.
        address podAddress;
        // Web reference pointg at the pod's root.
        bytes baseUrl;
        bool isActive;
    }

    // Struct representing resources' metadata.
    struct Resource {
        int id;
        address owner;
        // WEB reference pointing at the resource.
        bytes url;
        // Identifier of the pod in wich the resource is stored.
        int podId;
        bool isActive;
    }
}
