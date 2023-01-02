import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
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
  },
};

export default config;
