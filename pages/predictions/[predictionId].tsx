/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { ethers } from "ethers";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../../components/Header";
import { abi } from "../../constants/constants";
import {
  getContractAddress,
  getPredictionContract,
} from "../../utils/helper-functions";

type props = {
  data: any;
  contestId: any;
};

const Prediction = ({ data, contestId }: props) => {
  const router = useRouter();

  const [value, setValue] = useState<string>("");
  const [predictions, setpredictions] = useState<any>();
  const [latestPrice, setLatestPrice] = useState<number>(0);
  const [balance, setBalance] = useState<any>();
  const [publishing, setPublishing] = useState<boolean>(false);
  const amount = ethers.utils.parseEther("1");
  const [winners, setwinners] = useState<Array<any>>([]);
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex!);

  const { runContractFunction: predict } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "predict",
    params: {
      contestId: contestId,
      _predictedValue: parseInt(value),
    },
  });

  const getData = async () => {
    try {
      fetch(
        `https://predictions-api-production.up.railway.app/predictions?contestId=${contestId}`
      )
        .then((res) => res.json())
        .then((data) => setpredictions(data));
      getUpdatedPrice();
    } catch (error) {
      console.error(error);
    }
  };

  const getResult = async () => {
    try {
      fetch(
        `https://predictions-api-production.up.railway.app/getResult?contestId=${contestId}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.length == 100) {
            setwinners(data);
            if (typeof window !== undefined) {
              window.localStorage.setItem("winners", JSON.stringify(data));
            }
          }
          getData();
        });
    } catch (error) {
      console.error(error);
    }
  };

  const getUpdatedPrice = async () => {
    const contract = await getPredictionContract("provider", chainId);
    const priceData = await contract!.getLatestPrice(contestId);
    setLatestPrice(parseInt(priceData[0].toString()) / 10 ** priceData[1]);
  };

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

  const listenForContestCompletion = async () => {
    const contract = await getPredictionContract("provider", chainId);
    await new Promise<void>(async (resolve, reject) => {
      contract?.on("ContestCompleted", async () => {
        try {
          getData();
          setPublishing(false);
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
          getResult();
          setPublishing(true);
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
      listenForContestCompletion();
    }
    if (typeof window! === undefined && winners?.length === 0) {
      const data = window.localStorage.getItem("winners");
      if (data) {
        setwinners(data);
      }
    }
  }, [account, winners]);

  return (
    <div
      style={{
        backgroundImage:
          "url(https://media.istockphoto.com/id/1216628493/photo/dark-blue-de-focused-blurred-motion-abstract-background.jpg?s=612x612&w=0&k=20&c=05Tj4HnPzXDlAQl-UIc39zXVxs_W79HHwBPJz-AFJhE=)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="w-full min-h-[100vh] bg-bgnavy flex flex-col items-center justify-start  scrollbar-hide"
    >
      <Header />
      <div className="relative w-[60%] h-[60vh] bg-white rounded-2xl flex items-center justify-between mt-[8%]">
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
            {predictions?.length <= 0 && winners?.length > 0
              ? "Last Winners"
              : "Last Predictions"}
          </h1>
          <div className="w-[95%] h-[90%] flex flex-col items-center justify-start pt-[5%] box-border overflow-y-scroll scrollbar-hide">
            {publishing ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h1 className="text-black font-medium text-[0.9rem]">
                  Result Publishing please wait
                </h1>
              </div>
            ) : predictions?.length <= 0 && winners?.length > 0 ? (
              winners?.map((item: any, index: number) => (
                <h1
                  key={index}
                  className="font-medium text-gray-700 text-[1.2rem] mb-2"
                >
                  {index + 1}. {item?.user?.toString()}
                </h1>
              ))
            ) : (
              predictions?.map((item: any, index: number) => (
                <h1
                  key={index}
                  className="font-medium text-gray-700 text-[1.2rem] mb-2"
                >
                  {index + 1}. {item?.predictedValue?.toString()}
                </h1>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const predictionId = context.query.predictionId;
  const response = await fetch(
    `https://predictions-api-production.up.railway.app/predictions?contestId=${predictionId}`
  );

  const data = await response.json();

  return {
    props: {
      data: data,
      contestId: predictionId,
    },
    // props: { token }
    // You could do this either with useRouter or passing props
  };
};