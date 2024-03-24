import { task } from "hardhat/config";

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });
require('hardhat-abi-exporter');
// npx hardhat export-abi
// npx hardhat clear-abi
// npx hardhat run --network onustestnet ./scripts/1_deploy.ts

import { HardhatUserConfig } from "hardhat/types";
import { NetworkUserConfig } from "hardhat/types";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

const MNEMONIC = process.env.MNEMONIC || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://" + network + ".infura.io/v3/" + INFURA_API_KEY;
  return {
    // accounts: {
    //   count: 10,
    //   initialIndex: 0,
    //   mnemonic: MNEMONIC,
    //   path: "m/44'/60'/0'/0",
    // },
    accounts: [PRIVATE_KEY],
    chainId: chainIds[network],
    url,
  };
}

function createBSCTestnetConfig(): NetworkUserConfig {
  const url: string = "https://data-seed-prebsc-1-s1.binance.org:8545";
  return {
    accounts: [PRIVATE_KEY],
    chainId: 97,
    url,
  };
}

function createONUSTestnetConfig(): NetworkUserConfig {
  const url: string = "https://rpc-testnet.onuschain.io";
  return {
    accounts: [PRIVATE_KEY],
    chainId: 1945,
    url,
  };
}
function createONUSMainnetConfig(): NetworkUserConfig {
  const url: string = "https://rpc.onuschain.io";
  return {
    accounts: [PRIVATE_KEY],
    chainId: 1975,
    url,
  };
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // accounts: {
      //   mnemonic: MNEMONIC,
      // },
      chainId: chainIds.hardhat,
    },
    mainnet: createTestnetConfig("mainnet"),
    goerli: createTestnetConfig("goerli"),
    kovan: createTestnetConfig("kovan"),
    rinkeby: createTestnetConfig("rinkeby"),
    ropsten: createTestnetConfig("ropsten"),
    bsctestnet: createBSCTestnetConfig(),
    onustestnet: createONUSTestnetConfig(),
    onusmainnet: createONUSMainnetConfig()
  },
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: {onustestnet: "abc", onusmainnet: "onusmainnet", mainnet : "VUWMHB3MTJTQG3QF62PB96VRFKIZRKWQ55", goerli: "VUWMHB3MTJTQG3QF62PB96VRFKIZRKWQ55"},

    customChains: [
      {
        network: "onusmainnet",
        chainId: 1975,
        urls: {
          apiURL: "https://explorer.onuschain.io/api",
          browserURL: "https://explorer.onuschain.io/"
        }
      },
      {
        network: "onustestnet",
        chainId: 1945,
        urls: {
          apiURL: "https://explorer-testnet.onuschain.io/api",
          browserURL: "https://explorer-testnet.onuschain.io/"
        }
      }
    ]

  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    // enabled: process.env.REPORT_GAS ? true : false,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
