/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import {
  getContractAddress,
  getPredictionContract,
  getTokenAddress,
  getTokenContract,
} from "../utils/helper-functions";
import { abi, tokenABI } from "../constants/constants";
import { ethers } from "ethers";
import { FaPlus } from "react-icons/fa";
import { GetServerSideProps } from "next";
type modal = {
  id: number;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
};

function Modal({ id, setShowModal, showModal }: modal) {
  const [value, setValue] = useState<string>("");
  const [predictions, setpredictions] = useState<any>();
  const [latestPrice, setLatestPrice] = useState<number>(0);
  const [balance, setBalance] = useState<any>();
  const [allowance, setAllowance] = useState<any>();
  const amount = ethers.utils.parseEther("1");
  const [winners, setwinners] = useState<Array<any>>([]);
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex!);
  const { runContractFunction: getPredictions } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "getPredictions",
    params: { contestId: id },
  });

  const { runContractFunction: predict } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "predict",
    params: {
      contestId: id,
      _predictedValue: parseInt(value),
    },
  });

  const getData = async () => {
    try {
      fetch(`http://localhost:5000/predictions?contestId=${id}`)
        .then((res) => res.json())
        .then((data) => setpredictions(data));
      const balance = await getBalance();
      setBalance(ethers.utils.formatEther(balance!.toString()).toString());
      getUpdatedPrice();
    } catch (error) {
      console.error(error);
    }
  };

  const getUpdatedPrice = async () => {
    const contract = await getPredictionContract("provider", chainId);
    const priceData = await contract!.getLatestPrice(id);
    setLatestPrice(parseInt(priceData[0].toString()) / 10 ** priceData[1]);
  };

  const { runContractFunction: getBalance } = useWeb3Contract({
    abi: tokenABI,
    contractAddress: getTokenAddress(chainId),
    functionName: "balanceOf",
    params: { account: account },
  });

  const listenPrediction = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>(async (resolve, reject) => {
      contract?.on("NewPrediction", async () => {
        try {
          getData();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const listenForResult = async () => {
    const contract = await getPredictionContract("provider", chainId);

    await new Promise<void>(async (resolve, reject) => {
      contract?.on("ResultAnnounced", async () => {
        try {
          // fetch("")
          getData();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const participate = async (value: string) => {
    if (value == ("" || null)) return;
    await predict({
      onSuccess: () => {
        getData();
        setValue("");
      },
    });

    setValue("");
  };

  useEffect(() => {
    if (account) {
      getData();
      getUpdatedPrice();
      listenPrediction();
      listenForResult();
    }
  }, [account, showModal]);
  if (showModal) {
    return (
      <div className="fixed top-0 bottom-0 left-0 right-0 m-auto w-full h-full bg-bgModal flex items-center justify-center">
        <div className="relative w-[60%] h-[60%] bg-white rounded-2xl flex items-center justify-between">
          <h1 className="text-black">{id}</h1>
          <div
            onClick={() => setShowModal(false)}
            className="absolute -top-[15px] -right-[15px] w-[30px] h-[30px] flex items-center justify-center rounded-[100%] bg-gray-300"
          >
            <FaPlus size={18} className="rotate-45" />
          </div>
          <div className="w-[45%] h-full flex flex-col items-center justify-start pt-[5%] box-border">
            <h1 className="font-bold text-[1.5rem] text-gray-500">Predict</h1>
            <input
              type="text"
              placeholder="0.000"
              onChange={(e) => setValue(e.target.value)}
              value={value}
              className="w-[70%] h-[30%] max-h-[40px] rounded-xl bg-gray-100 my-5 shadow-card pl-[15px] box-border text-black "
            />
            <h1 className="text-gray-600 font-light my-2">
              Prediction Fee : 1 TKN
            </h1>
            <h1 className="text-gray-600 font-light ">
              Current Value : {latestPrice}
            </h1>

            <button
              onClick={async () => {
                await participate(value);
              }}
              className="w-[50%] h-[50%] bg-gradient-to-tr from-pink-500  to-blue-400 max-h-[35px] max-w-[150px] rounded-md mt-[10%] text-white"
            >
              Predict
            </button>
          </div>
          <div className="h-[95%] w-[1px] border-[1px] border-gray-500"></div>
          <div className="w-[45%] h-full flex flex-col items-center justify-start pt-[5%] box-border">
            <h1 className="font-bold text-[1.5rem] text-gray-500 underline">
              Last Predictions
            </h1>
            <div className="w-[95%] h-[90%] flex flex-col items-center justify-start pt-[5%] box-border overflow-y-scroll scrollbar-hide">
              {predictions?.map((item: any, index: number) => (
                <h1
                  key={index}
                  className="font-medium text-gray-700 text-[1.2rem] mb-2"
                >
                  {index + 1}. {item.predictedValue.toString()}
                </h1>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <div className="hidden" />;
}

export default Modal;
