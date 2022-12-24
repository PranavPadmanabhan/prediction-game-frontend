/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { ConnectButton } from "web3uikit";
import {
  getContractAddress,
  getPredictionContract,
  getTokenAddress,
} from "../utils/helper-functions";
import { abi, tokenABI } from "../constants/constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";

function Header() {
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const [balance, setbalance] = useState<string>("");
  const chainId = parseInt(chainHex!);

  const {
    runContractFunction: mint,
    isFetching: dataFetching,
    isLoading: mining,
  } = useWeb3Contract({
    abi: tokenABI,
    contractAddress: getTokenAddress(chainId),
    functionName: "mint",
    params: {},
  });

  const {
    runContractFunction: balanceOf,
    isFetching: balanceFetching,
    isLoading: balanceLoading,
  } = useWeb3Contract({
    abi: tokenABI,
    contractAddress: getTokenAddress(chainId),
    functionName: "balanceOf",
    params: { account: account },
  });
  const getBalance = async () => {
    const contract = await getPredictionContract("provider", chainId);
    const balance = await contract?.provider.getBalance(account!);
    setbalance(ethers.utils.formatEther(balance!.toString()).toString());
  };

  const listenPrediction = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await contract?.on("NewPrediction", async () => {
      getBalance();
    });
  };

  const listenForResult = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await contract?.on("ContestCompleted", async () => {
      getBalance();
    });
  };

  useEffect(() => {
    if (account) {
      getBalance();
      listenForResult();
      listenPrediction();
    }
  }, [account]);

  return (
    <header className="w-full h-[10vh] bg-transparent flex items-center justify-end border-b-2 border-b-[#EFEFEF] px-3 box-border">
      {account && getContractAddress(chainId) ? (
        <div className="w-[20%] h-full flex items-center justify-start">
          <h1 className="text-white mr-5 text-[0.9rem]">
            Balance : {balance.slice(0, 8)} ETH
          </h1>
        </div>
      ) : (
        <ConnectButton moralisAuth={false} />
      )}
    </header>
  );
}

export default Header;
