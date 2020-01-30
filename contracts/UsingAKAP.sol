// Copyright (C) 2020  Christian Felde

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

pragma solidity ^0.5.0;

import "akap/contracts/IAKAP.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract UsingAKAP {
    address public akapAddress;
    uint public node;

    constructor(address _akapAddress) public {
        akapAddress = _akapAddress;

        // Instantiate AKAP from address
        IAKAP akap = IAKAP(akapAddress);

        // Claim a new node using this contracts address as a random seed.
        // The node will use the root node at id 0 as it's parent.
        uint parent = 0;
        node = akap.hashOf(parent, abi.encode(address(this)));
        require(akap.claim(parent, abi.encode(address(this))) > 0, "Unable to claim node");

        // Store this contract address on node
        akap.setSeeAddress(node, address(this));

        // Approve msg.sender as operator on the node, so that
        // the contract creator can operate on the node. We will use
        // features from ERC-721 to do this.
        IERC721 erc721 = IERC721(akapAddress);
        erc721.setApprovalForAll(msg.sender, true);
    }

    // Because we approved the msg.sender on the node, they can
    // modify this node + create child nodes under it.
    // That can be used to give this contract access to values, for example..

    function getValue(bytes memory label) public view returns (bytes memory) {
        // There are other fields on a node as well, but we're just
        // going to use the nodeBody here.
        IAKAP akap = IAKAP(akapAddress);
        uint valueId = akap.hashOf(node, label);

        if (akap.exists(valueId)) {
            return akap.nodeBody(valueId);
        } else {
            return "";
        }
    }

    function getValue1() public view returns (bytes memory) {
        bytes memory k = new bytes(1);
        k[0] = byte(uint8(1));
        return getValue(k);
    }

    function getValue2() public view returns (bytes memory) {
        bytes memory k = new bytes(1);
        k[0] = byte(uint8(2));
        return getValue(k);
    }

    // We're also going to keep a count of the number of calls to the next function,
    // stored on the node we claimed above. This shows how the contract can be used
    // to write values to a node, not just read values from a node like above.

    function increaseCounter() public {
        IAKAP akap = IAKAP(akapAddress);

        // Read current counter value
        bytes memory counter = akap.nodeBody(node);

        uint x;
        if (counter.length == 0) {
            // First call, set to 1
            x = 1;
        } else {
            assembly {
                x := mload(add(counter, 0x20))
            }
            // Not first call, increase value by 1
            x++;
        }

        counter = new bytes(32);
        assembly {
            mstore(add(counter, 32), x)
        }

        // Store the updated counter on node
        akap.setNodeBody(node, counter);
    }

    // Nodes need to be reclaimed at least once a year if you want to keep ownership.
    // It's often helpful to add a reclaim function on a contract to help facilitate this.

    // Simply call the below function once before the expiry to update the expiry field.

    // Because child nodes can't be claimed by others if we maintain ownership of the parent,
    // there is no need to reclaim the two value nodes under our contract node.

    function reclaim() public {
        IAKAP akap = IAKAP(akapAddress);
        uint parent = 0;

        // You reclaim just like you claim initially
        require(akap.claim(parent, abi.encode(address(this))) > 0, "Unable to claim node");
    }
}
