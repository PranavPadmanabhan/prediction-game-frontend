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
import { useRouter } from "next/router";

function Header() {
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const [balance, setbalance] = useState<string>("");
  const [refunds, setRefunds] = useState("");
  const [rewards, setRewards] = useState("");
  const [amountRefund, setamountRefund] = useState<any>("");
  const [amountReward, setamountReward] = useState<any>("");
  const chainId = parseInt(chainHex!);
  const router = useRouter();

  const getBalance = async () => {
    const contract = await getPredictionContract("provider", chainId);
    const balance = await contract?.balanceOf(account!);
    setbalance(ethers.utils.formatEther(balance!.toString()).toString());
  };

  const listenPrediction = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>((resolve, reject) => {
      contract?.on("NewPrediction", async () => {
        try {
          getBalance();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const listenForTopUp = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>((resolve, reject) => {
      contract?.on("WithdrawSuccessfull", async () => {
        try {
          getBalance();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const listenForWithdraw = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>((resolve, reject) => {
      contract?.on("TopUpSuccessfull", async () => {
        try {
          getBalance();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const listenForResult = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>((resolve, reject) => {
      contract?.on("ContestCompleted", async () => {
        try {
          getBalance();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const listenForContestCompletion = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>(async (resolve, reject) => {
      contract?.on("ContestCompleted", async () => {
        try {
          getBalance();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  useEffect(() => {
    if (account) {
      getBalance();
      listenForResult();
      listenPrediction();
      listenForTopUp();
      listenForWithdraw();
      listenForContestCompletion();
    }
  }, [account]);

  return (
    <header className="w-full h-[10vh] bg-transparent flex items-center justify-end border-b-2 border-b-[#EFEFEF] px-3 box-border">
      {account && getContractAddress(chainId) ? (
        <div className="w-[70%] h-full flex items-center justify-end">
          <button
            onClick={() => router.push("/wallet")}
            className="w-[150px] h-[35px] rounded-md bg-gray-200  text-black mr-5 text-[0.7rem]"
          >
            Balance : {balance.slice(0, 8)} ETH
          </button>
        </div>
      ) : (
        <ConnectButton moralisAuth={false} />
      )}
    </header>
  );
}

export default Header;
