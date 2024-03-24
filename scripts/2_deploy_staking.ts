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
    const lp_address = "0xA37D47d8C9D52697Cc14f6ea55aA1e3458537052";
    const token_address = "0xA7b10Ec5C7F8566358fdC7fEd22F5E2c6752e84B";
    const duration = 31536000;
    const amount_token_staking = "36500000000000000000000000";

    //deploy UniswapV3Factory
    const StakingRewards: ContractFactory = await ethers.getContractFactory(
        'StakingRewards',
    );
    const _StakingRewards: Contract = await StakingRewards.deploy(lp_address, token_address, duration);
    await _StakingRewards.deployed();
    console.log('StakingRewards deployed to: ', _StakingRewards.address);

    // const Token = await ethers.getContractFactory("Dequity");
    // const contract = Token.attach(
    //     token_address // The deployed contract address
    // );
    // // console.log("name",await contract.name());
    //
    // await contract.approve(_StakingRewards.address, "100000000000000000000000000");
    // // console.log("approve tx:", approve.tx)
    //
    // //noti
    // const Stk_instance = await ethers.getContractFactory("StakingRewards");
    // const _Stk_instance = Stk_instance.attach(
    //     token_address // The deployed contract address
    // );
    //
    // let noti = await _Stk_instance.notifyRewardAmount(amount_token_staking);
    // console.log("noti tx:", noti)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
