const hre = require("hardhat");
const ethers = hre.ethers;
const { deployContract, contractAt, sendTxn } = require("./shared/helpers");
const helpers  = require("@nomicfoundation/hardhat-network-helpers");

async function balance(address) {
  return await ethers.provider.getBalance(address);
}
async function _timestamp() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
}

const maxDeadLine = 9999999999;


//////////////////////////////////////////////////////////////////////
// TEST NORMAL CASE: ADD/REMOVE, BUY/SELL, CLAIM REWARD HOLDER OK   //
//////////////////////////////////////////////////////////////////////

async function main() {
  let signers = await ethers.getSigners();
  const deployer = signers[0];
  const dev = signers[1];
  const a1 = signers[2];
  const a2 = signers[3];
  const a3 = signers[4];
  const user1 = signers[7];
  const user2 = signers[8];
  const WETH = await deployContract("WETH", []);
  const Factory = await deployContract("UniswapV2Factory", [deployer.address]);
  const Router = await deployContract("UniswapV2Router02", [
    Factory.address,
    WETH.address,
  ]);
  console.log("V2 Factory: ", Factory.address);
  console.log("V2 Router: ", Router.address);

  const Token = await deployContract("Quadrazhao", [
    dev.address,
    Router.address
  ]);
  console.log("Token: ", Token.address);
  console.log("Token owner: ", await Token.owner());
  console.log("deployer address : ", deployer.address);

  let pair = await Factory.allPairs(0);
  console.log("Pair address in factory", pair);
  const pairLP = await contractAt("UniswapV2Pair", pair);
  const DividendTracker = await contractAt(
    "QuadrazhaoDividendTracker",
    Token.dividendTracker()
  );
  //
  console.log("Pair address in token: ", await Token.pair());
  await sendTxn(
    Token.connect(deployer).approve(
      Router.address,
      ethers.utils.parseEther("1000000000")
    ),
    "Token.approve"
  );
  //5_000_000
  await sendTxn(
    Router.addLiquidityETH(
      Token.address,
      ethers.utils.parseEther("2reremix000000"),
      0,
      0,
      deployer.address,
      maxDeadLine,
      { value: ethers.utils.parseEther("2") }
    ),
    "Router.addLiquidityETH"
  );
  console.log(
    "Deployer LP balance: ",
    await pairLP.balanceOf(deployer.address)
  );

  let dk = false;
  try {
    await sendTxn(
      Router.connect(user1).swapExactETHForTokensSupportingFeeOnTransferTokens(
        0,
        [WETH.address, Token.address],
        user1.address,
        maxDeadLine,
        { value: ethers.utils.parseEther("0.01") }
      ),
      "Router.swapExactETHForTokensSupportingFeeOnTransferTokens"
    );
    dk = true;
  } catch (error) {
    console.log(
      "============***Yeah pass when now activated trading***============"
    );
  }
  if(dk) throw("ERROR AT ENABLETRADING");
  await sendTxn(Token.activateTrading(), "Token.activateTrading");

  // user1 buy 2 times
  let buyAmount = ethers.utils.parseEther("0.2");

  for (let i = 0; i < 3; i++) {
    if(i==1) {
      await helpers.time.increase(30);//fee 3% after anti bot
    }
    await helpers.mine();
    let amountOut = (await Router.getAmountsOut(buyAmount, [WETH.address, Token.address]))[1];
    let user1BalanceBefore = (await Token.balanceOf(user1.address));
    let balanceTokenBefore=(await Token.balanceOf(Token.address));
    // console.log("Balance token inside contract before buy: ", balanceTokenBefore/10**18);

    await sendTxn(
      Router.connect(user1).swapExactETHForTokensSupportingFeeOnTransferTokens(
        0,
        [WETH.address, Token.address],
        user1.address,
        maxDeadLine,
        { value: buyAmount }
      ),
      "Router.swapExactETHForTokensSupportingFeeOnTransferTokens"
    );
    let user1BalanceAfter = (await Token.balanceOf(user1.address));
    // console.log("user1Balance: ", user1Balance / 10 ** 18);
    let balanceTokenAfter = (await Token.balanceOf(Token.address));
    // console.log("BalanceToken token for fee after: ", balanceTokenAfter/ 10 ** 18);
    console.log("Estimate fee buy for dev + holder ", (balanceTokenAfter-balanceTokenBefore)/amountOut*100);
    console.log("Buyer percentage ", (user1BalanceAfter-user1BalanceBefore)/amountOut*100);
    console.log("fee in token:", ethers.utils.formatEther(balanceTokenAfter));
    // console.log(
    //   "User 1 check token holder reward: ",
    //   await DividendTracker.getAccount(user1.address)
    // );
  }

  //test if normal transfer take fee:
  console.log("balance ETH user 1 before:", await balance(user1.address));
  await sendTxn(Token.connect(user1).transfer(user2.address, ethers.utils.parseEther("100000")),"Token.transfer");
  // if( await Token.balanceOf(user2.address)/10**18 != 1) throw("FEE ON NORMNAL TRANSFER");
  console.log("balance ETH user 1 after:", await balance(user1.address));
  console.log("fee in token:", ethers.utils.formatEther(await Token.balanceOf(Token.address)));

   // user 1 add LP
  //  await sendTxn(
  //   Token.connect(user1).approve(
  //     Router.address,
  //     ethers.utils.parseUnits("10000000000", 18)
  //   ),
  //   "Token.approve"
  // );
  // await helpers.mine();
  // //add lp 300_000
  // await sendTxn(
  //   Router.connect(user1).addLiquidityETH(
  //     Token.address,
  //     ethers.utils.parseUnits("300000", 18),
  //     0,
  //     0,
  //     user1.address,
  //     maxDeadLine,
  //     { value: ethers.utils.parseEther("1") }
  //   ),
  //   "Router.addLiquidityETH"
  // );
  // console.log(
  //   "User1 LP balance: ",
  //   await pairLP.balanceOf(user1.address)
  // );

  await sendTxn(
    Token.connect(user1).approve(Router.address, ethers.utils.parseUnits("1000000", 18)),
    "Token.approve"
  );

  // await helpers.time.increase(100);
  // console.log("Before block bot");
  // await Token.addToBlacklist([user1.address]);
  // dk = false;
  // try {
  //   await sendTxn(
  //     Router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
  //       ethers.utils.parseUnits("1000", 18),
  //       0,
  //       [Token.address, WETH.address],
  //       user1.address,
  //       maxDeadLine,
  //     ),
  //     "Router.swapExactETHForTokensSupportingFeeOnTransferTokens"
  //   );
  //   dk = true;
  // } catch (error) {
  //   console.log("Block bot run OK");
  // }
  // if(dk) throw("ERROR AT BLOCK BOT");
  // console.log("After block bot");
  // await helpers.time.increase(10000);
  // await Token.removeBlacklist([user1.address]);
  // console.log("After unblock bot");

  let user1Balance = await Token.balanceOf(user1.address);
  console.log("user1Balance before sell: ", user1Balance / 10 ** 18);

  await sendTxn(
    Token.connect(user1).approve(Router.address, ethers.utils.parseEther("1000000000"),),
    "Token.approve"
  );

  // sell 1k
  // 2 times 10_000
  let sellAmount = ethers.utils.parseUnits("10000", 18);
  let swapAtAmount = ethers.utils.parseUnits("30000", 18);
  for(let i = 0; i<2; i++){
    let balanceTokenBefore=(await Token.balanceOf(Token.address));
    let user1RewardBefore =(await DividendTracker.getAccount(user1.address))[1];
    let marketingBalanceBefore = await ethers.provider.getBalance(dev.address);
    console.log("Balance token inside contract before sell: ", balanceTokenBefore/10**18);
    if(balanceTokenBefore >= swapAtAmount){
      balanceTokenBefore = balanceTokenBefore - swapAtAmount;
    }
    await sendTxn(
      Router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
        sellAmount,
        0,
        [Token.address, WETH.address],
        user1.address,
        maxDeadLine,
      ),
      "Router.swapExactETHForTokensSupportingFeeOnTransferTokens"
    );
    let user1Balance = (await Token.balanceOf(user1.address));
    // console.log("user1Balance: ", user1Balance / 10 ** 18)
    let balanceTokenAfter = (await Token.balanceOf(Token.address));
    // console.log("BalanceToken token for fee after: ", balanceTokenAfter/ 10 ** 18);
    console.log("Estimate fee sell for holder + mkt", (balanceTokenAfter-balanceTokenBefore)/sellAmount*100);
    let user1RewardAfter = (await DividendTracker.getAccount(user1.address))[1];
    let marketingBalanceAfter = await ethers.provider.getBalance(dev.address);
    // if(marketingBalanceAfter-marketingBalanceBefore == 0) {
    //   console.log("No new reward hehe");
    //   console.log("holder reward: ", user1RewardAfter- user1RewardBefore);
    // }
    // console.log("% fee holder / marketing",(user1RewardAfter- user1RewardBefore)/(marketingBalanceAfter-marketingBalanceBefore)*100);
  }

  console.log("user1 eth before: ", await balance(user1.address));
  console.log("user1 lp before: ", await pairLP.balanceOf(user1.address));
  await sendTxn(Token.connect(user1).claim(), "Token.claim()");
  console.log("user1 eth after: ", await balance(user1.address));
  console.log("user1 lp after: ", await pairLP.balanceOf(user1.address));


  await sendTxn(
    pairLP.connect(deployer).approve(Router.address, ethers.utils.parseEther("1000000000000000000"),),
    "pairLP.approve"
  );
  console.log("Balance LP of deployer before: ", await pairLP.balanceOf(deployer.address));
  await sendTxn(
    Router.connect(deployer).removeLiquidity(
      Token.address,
      WETH.address,
      await pairLP.balanceOf(deployer.address),
      0,
      0,
      deployer.address,
      maxDeadLine,
    ),
    "Router.removeLiquidity"
  );
  console.log("Balance LP of deployer after: ", await pairLP.balanceOf(deployer.address));
}
main();
