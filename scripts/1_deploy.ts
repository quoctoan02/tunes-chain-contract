// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';

async function main(): Promise<void> {
    // Hardhat always runs the compile task when running scripts through it.
    // If this runs in a standalone fashion you may want to call compile manually
    // to make sure everything is compiled
    // await run("compile");
    // We get the contract to deploy
    const signers = await ethers.getSigners();
    const name = "TEST";
    const symbol = "TEST";

    //deploy UniswapV3Factory
    const TokenTest: ContractFactory = await ethers.getContractFactory(
        'TokenTest',
    );
    const _TokenTest: Contract = await TokenTest.deploy(name,symbol);
    await _TokenTest.deployed();
    console.log('TokenTest deployed to: ', _TokenTest.address);

//     const MyContract = await ethers.getContractFactory("MyContract");
//     const contract = MyContract.attach(
//         "0x..." // The deployed contract address
//     );
//
// // Now you can call functions of the contract
//     await contract.doTheThing();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
