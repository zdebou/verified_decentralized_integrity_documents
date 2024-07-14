// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../Libraries/Ownable.sol";
import "../Tokenization/Subscription.sol";

/*
Upload Document: A user calls the uploadDocument function with the document's fingerprint and signature.
Retrieve Documents: Anyone can call the getDocuments function with a user's address to get all documents uploaded by that user.
*/
contract OwnedDocumentStorage is Ownable {
    mapping(address => Document[]) public userDocuments;
    string public caChain;

    event DocumentUploaded(
        address indexed user,
        bytes32 fingerprint,
        string signature,
        uint256 timestamp
    );

    function uploadDocument(
        bytes32 _fingerprint,
        string memory _signature,
        string memory _location
    ) public onlyOwner {
        require(!documentExists(_fingerprint), "Document already exists");
        require(bytes(_signature).length > 0, "Signature cannot be empty");
        require(_fingerprint != bytes32(0), "Fingerprint cannot be empty");

        Document memory newDocument = Document({
            fingerprint: _fingerprint,
            signature: _signature,
            timestamp: block.timestamp,
            documentLocation: _location
        });
        userDocuments[msg.sender].push(newDocument);

        emit DocumentUploaded(
            msg.sender,
            _fingerprint,
            _signature,
            block.timestamp
        );
    }

    function documentExists(bytes32 _fingerprint) internal view returns (bool) {
        Document[] memory documents = userDocuments[msg.sender];
        for (uint256 i = 0; i < documents.length; i++) {
            if (documents[i].fingerprint == _fingerprint) {
                return true;
            }
        }
        return false;
    }

    function getDocuments(
        address _user
    ) public view returns (Document[] memory) {
        return userDocuments[_user];
    }

    function getDocumentByFingerprint(
        address _user,
        bytes32 _fingerprint
    ) public view returns (Document memory) {
        Document[] memory documents = userDocuments[_user];
        for (uint256 i = 0; i < documents.length; i++) {
            if (documents[i].fingerprint == _fingerprint) {
                return documents[i];
            }
        }
        revert("Document not found");
    }

    function getDocumentsRecorder() public returns (Document[] memory) {
        Subscription subscription = new Subscription();
        subscription.purchaseSubscription();
        return userDocuments[msg.sender];
    }

    struct Document {
        bytes32 fingerprint;
        string signature;
        uint256 timestamp;
        string documentLocation;
    }
}
