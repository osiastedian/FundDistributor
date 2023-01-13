import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    rollux: {
      url: "https://testnet.rollux.com:2814/",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 2814,
    },
    tanembaum: {
      url: "https://rpc.tanenbaum.io/",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 5700,
    },
    nevm: {
      url: "https://rpc.syscoin.org",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 57,
    },
  },
};

export default config;
