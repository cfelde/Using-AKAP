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
import "akap-utils/contracts/domain/DomainManager.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "akap-utils/contracts/types/Uint256Lib.sol";
import "akap-utils/contracts/types/BytesLib.sol";
import "akap-utils/contracts/types/ConvertUtils.sol";

contract ExampleOne {
    using Uint256Lib for uint;
    using BytesLib for bytes;

    DomainManager public dm;
    IAKAP public akap;
    uint public rootPtr;

    constructor(address _dmAddress, uint _rootPtr) public {
        dm = DomainManager(_dmAddress);
        akap = dm.akap();
        rootPtr = _rootPtr;

        require(akap.exists(rootPtr), "ExampleOne: No root pointer");
    }

    function getValue(uint key) public view returns (bytes memory) {
        uint valueId = akap.hashOf(rootPtr, key.asBytes());

        if (akap.exists(valueId)) {
            return akap.nodeBody(valueId);
        } else {
            return "";
        }
    }

    function getValue1() public view returns (string memory) {
        return getValue(1).asString();
    }

    function getValue2() public view returns (uint) {
        return getValue(2).asUint256();
    }

    function increaseCounter() public {
        // Read current counter value
        uint x = akap.nodeBody(rootPtr).asUint256();

        // Increase by 1
        x += 1;

        // Store the updated counter on node
        akap.setNodeBody(rootPtr, x.asBytes());
    }
}
