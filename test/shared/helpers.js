const hre = require("hardhat");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTxn(txnPromise, label) {
  const txn = await txnPromise
  // console.info(`Sending ${label}...`)
  await txn.wait()
  // console.info(`... Sent! ${txn.hash}`)
  // await sleep(500)
  return txn
}

async function callWithRetries(func, args, retriesCount = 3) {
  let i = 0
  while (true) {
    i++
    try {
      return await func(...args)
    } catch (ex) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount)
        throw ex
      }
      console.error("call i=%s failed. retrying....", i)
      console.error(ex.message)
    }
  }
}

async function deployContract(name, args, label, options) {
  if (!options && typeof label === "object") {
    label = null
    options = label
  }

  let info = name
  if (label) { info = name + ": " + label }
  const contractFactory = await hre.ethers.getContractFactory(name)
  let contract
  if (options) {
    contract = await contractFactory.deploy(...args, options)
  } else {
    contract = await contractFactory.deploy(...args)
  }
  // const argStr = args.map((i) => `"${i}"`).join(" ")
  console.info(`Deploying ${info} = ${contract.address}`)
  let tx = await contract.deployTransaction.wait()
  if(label === undefined) console.info(`Completed ${info} at txHash: ${tx.transactionHash }`)
  else console.info(`Completed ${label} at txHash: ${tx.transactionHash }`)
  console.info(`========================`)
  return contract
}

async function contractAt(name, address, provider) {
  let contractFactory = await hre.ethers.getContractFactory(name)
  if (provider) {
    contractFactory = contractFactory.connect(provider)
  }
  return await contractFactory.attach(address)
}

module.exports = {
  sendTxn,
  deployContract,
  contractAt,
  callWithRetries,
}
