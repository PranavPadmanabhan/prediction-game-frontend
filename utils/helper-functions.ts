import { ethers } from "ethers";
import {
  abi,
  contractAdresses,
  tokenABI,
  tokenAddresses,
} from "../constants/constants";

export const getContractAddress = (chainId: any) => {
  switch (chainId) {
    case 31337:
      return contractAdresses["31337"][contractAdresses["31337"].length - 1];
    case 5:
      if ("5" in contractAdresses) {
        return contractAdresses["5"][contractAdresses["5"].length - 1];
      }
    default:
      return contractAdresses["31337"][contractAdresses["31337"].length - 1];
  }
};

export const getTokenAddress = (chainId: any) => {
  switch (chainId) {
    case 31337:
      return tokenAddresses["31337"][tokenAddresses["31337"].length - 1];
    case 5:
      if ("5" in contractAdresses) {
        return tokenAddresses["5"][tokenAddresses["5"].length - 1];
      }
    default:
      return tokenAddresses["31337"][tokenAddresses["31337"].length - 1];
  }
};

export const getPredictionContract = async (
  type: "signer" | "provider",
  chainId?: any
) => {
  if (typeof window !== "undefined") {
    if (type === "provider") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        getContractAddress(chainId ?? 5),
        abi,
        provider
      );
      return contract;
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        getContractAddress(chainId ?? 5),
        abi,
        signer
      );
      return contract;
    }
  }
};

export const getSignerOrProvider = async (type: "provider" | "signer") => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (type == "provider") {
      return provider;
    } else {
      const signer = provider.getSigner();
      return signer;
    }
  }
};

export const getTokenContract = async (
  type: "signer" | "provider",
  chainId: any
) => {
  if (typeof window.ethereum !== "undefined") {
    if (type === "provider") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        getTokenAddress(chainId),
        tokenABI,
        provider
      );
      return contract;
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        getTokenAddress(chainId),
        tokenABI,
        signer
      );
      return contract;
    }
  }
};
