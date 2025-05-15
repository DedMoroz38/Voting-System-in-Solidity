// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Voting {
    address public admin;
    bool public votingEnded;

    string[] public candidates;
    mapping(string => uint) public votes;
    mapping(address => bool) public hasVoted;

    constructor(string[] memory _candidates) {
        admin = msg.sender;
        candidates = _candidates;
    }

    function vote(string memory candidate) public {
        require(!votingEnded, "Voting has ended");
        require(!hasVoted[msg.sender], "Already voted");

        bool valid = false;
        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(bytes(candidates[i])) == keccak256(bytes(candidate))) {
                valid = true;
                break;
            }
        }
        require(valid, "Invalid candidate");

        hasVoted[msg.sender] = true;
        votes[candidate]++;
    }

    function endVoting() public {
        require(msg.sender == admin, "Only admin can end voting");
        votingEnded = true;
    }

    function getVotes(string memory candidate) public view returns (uint) {
        return votes[candidate];
    }

    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
}
