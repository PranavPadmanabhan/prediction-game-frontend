import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../components/Header";
import { abi } from "../constants/constants";
import {
  getContractAddress,
  getPredictionContract,
} from "../utils/helper-functions";

const Wallet = () => {
  const [amount, setAmount] = useState<any>("");
  const [balance, setbalance] = useState<any>("");
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex!);
  //   const { runContractFunction: addFunds } = useWeb3Contract({
  //     abi: abi,
  //     contractAddress: getContractAddress(chainId),
  //     functionName: "addFunds",
  //     msgValue: amount,
  //   });

  //   const { runContractFunction: withdraw } = useWeb3Contract({
  //     abi: abi,
  //     contractAddress: getContractAddress(chainId),
  //     functionName: "withdraw",
  //     params: { amount: amount },
  //   });

  const getBalance = async () => {
    const contract = await getPredictionContract("provider", chainId);
    const balance = await contract?.balanceOf(account!);
    setbalance(ethers.utils.formatEther(balance!.toString()).toString());
  };

  const topUp = async (value: string) => {
    const amount = ethers.utils.parseEther(value);
    const contract = await getPredictionContract("signer", chainId);
    await contract?.addFunds({ value: amount });
  };

  const withdraw = async (value: string) => {
    const amount = ethers.utils.parseEther(value);
    const contract = await getPredictionContract("signer", chainId);
    await contract?.withdraw(amount);
  };

  const listenForTopUp = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>((resolve, reject) => {
      contract?.on("TopUpSuccessfull", async () => {
        try {
          getBalance();
          setAmount("");
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
      contract?.on("WithdrawSuccessfull", async () => {
        try {
          getBalance();
          setAmount("");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      getBalance();
      listenForTopUp();
      listenForWithdraw();
    }

    return () => {
      setAmount("");
    };
  }, [isWeb3Enabled, account]);

  return (
    <div
      style={{
        backgroundImage:
          "url(https://media.istockphoto.com/id/1216628493/photo/dark-blue-de-focused-blurred-motion-abstract-background.jpg?s=612x612&w=0&k=20&c=05Tj4HnPzXDlAQl-UIc39zXVxs_W79HHwBPJz-AFJhE=)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="w-screen h-screen flex flex-col items-center justify-start"
    >
      <Header />
      <div className="w-[50%] h-[70%] bg-gray-200 flex flex-col items-center justify-start mt-3 rounded-lg">
        <h1 className="mt-[10%] mb-3">wallet balance : {balance} ETH</h1>
        <input
          placeholder="enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="text"
          className="w-[75%] h-[45px] bg-gray-300 rounded-md pl-6 text-black focus:outline-none"
        />
        <div className="w-full h-[60px] flex items-center justify-center">
          <button
            onClick={async () => {
              if (parseFloat(amount) >= 0.05) {
                await topUp(amount).then(() => setAmount(""));
              } else {
                console.log("error");
              }
            }}
            className="w-[120px] h-[35px] rounded-md bg-blue-800 text-white text-[0.9rem] mr-5"
          >
            TopUp
          </button>
          <button
            onClick={async () => {
              if (balance >= 0.05) {
                await withdraw(amount).then(() => setAmount(""));
              } else {
                console.log("error");
                console.log(balance);
              }
            }}
            className="w-[120px] h-[35px] rounded-md bg-black text-white text-[0.9rem]"
          >
            withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
