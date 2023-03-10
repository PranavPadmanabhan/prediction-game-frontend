/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { ethers } from "ethers";
import {
  GetServerSideProps,
  GetStaticPaths,
  GetStaticProps,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import React, { useContext, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../../components/Header";
import { abi, PROVIDER } from "../../constants/constants";
import {
  getContractAddress,
  getPredictionContract,
} from "../../utils/helper-functions";

type props = {
  data: any;
  contestId: any;
  price: any;
  decimals: any;
  entranceFee: any;
};

const Prediction = ({
  data,
  contestId,
  decimals,
  price,
  entranceFee,
}: props) => {
  const router = useRouter();

  const [value, setValue] = useState<string>("");
  const [predictions, setpredictions] = useState<any>(data);
  const [latestPrice, setLatestPrice] = useState<number>(price);
  const [lastTimeStamp, setLastTimeStamp] = useState<any>(0);
  const [balance, setBalance] = useState<any>();
  const [publishing, setPublishing] = useState<boolean>(false);
  const [winners, setwinners] = useState<Array<any>>([]);
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex!);
  const [rewards, setRewards] = useState<any>([]);

  const { runContractFunction: predict } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "predict",
    params: {
      contestId: contestId,
      _predictedValue: parseFloat(value) * 10 ** decimals,
    },
  });

  const getData = async () => {
    try {
      const contract = await getPredictionContract("provider", chainId);
      const lastPlayers = await contract?.getContestPlayers(
        parseInt(contestId.toString())
      );
      const startingNumber = parseInt(lastPlayers.toString());
      const predictionsData = await contract?.getPredictions(
        parseInt(contestId.toString())
      );

      const predictions = predictionsData.filter((item: any, i: number) => {
        if (i >= startingNumber) {
          return item;
        }
      });
      const divisor = 10 ** decimals;

      const data: any[] = predictions.map((item: any) => ({
        predictedValue: parseFloat(item.predictedValue.toString()) / divisor,
        predictedAt: parseFloat(item.predictedAt.toString()),
        difference: parseFloat(item.difference.toString()),
        user: item.user.toString(),
      }));
      setpredictions(data);
      getUpdatedPrice();
    } catch (error) {
      console.error(error);
    }
  };

  const getUpdatedPrice = async () => {
    const contract = await getPredictionContract("provider", chainId);
    const priceData = await contract!.getLatestPrice(
      parseInt(contestId.toString())
    );
    setLatestPrice(parseInt(priceData[0].toString()) / 10 ** priceData[1]);
  };

  const listenPrediction = async () => {
    const contract = await getPredictionContract("provider", chainId);
    contract?.on("NewPrediction", async () => {
      try {
        getData();
      } catch (error) {
        console.error(error);
      }
    });
  };

  const listenForContestCompletion = async () => {
    const contract = await getPredictionContract("provider", chainId);
    contract?.on("ContestCompleted", async (id) => {
      try {
        if (id == contestId) {
          getData().finally(() => setPublishing(false));
        }
        // console.log(`ContestCompleted - id : ${contestId.toString()}`);
      } catch (error) {
        console.error(error);
      }
    });
  };

  // const addTimer = async () => {
  //   const res = await fetch(
  //     "https://prediction-backend-production.up.railway.app/getLatestTime"
  //   );
  //   const date = await res.json();
  //   const expire = new Date(date).getTime() * 1000;
  //   let now = new Date().getTime();
  //   console.log(expire - now);
  // };

  const listenForResult = async () => {
    const contract = await getPredictionContract("provider", chainId);
    contract?.on("ResultAnnounced", async () => {
      try {
        if (predictions.length > 0) {
          setPublishing(true);
        }
      } catch (error) {
        console.error(error);
      }
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
      getUpdatedPrice();
      listenPrediction();
      listenForResult();
      listenForContestCompletion();
    }

    return () => {};
  }, [contestId]);

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
            Prediction Fee : {entranceFee} ETH
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
                  className="font-medium text-gray-700 text-[0.8rem] mb-2"
                >
                  {index + 1}. {item?.user?.toString()} -{" "}
                  {item?.predictedValue?.toString()} -{" "}
                  {rewards[index].toString()}
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
  let predictionsData: any[];
  let priceData: any;
  const { predictionId } = context.query;
  const provider = new ethers.providers.WebSocketProvider(PROVIDER);
  const contract = new ethers.Contract(getContractAddress(5), abi, provider);
  const lastPlayers = await contract?.getContestPlayers(
    parseInt(predictionId!.toString())
  );
  const startingNumber = parseInt(lastPlayers.toString());

  predictionsData = await contract?.getPredictions(
    parseInt(predictionId!.toString())
  );

  const feeData = await contract.getEntranceFee();
  const fee = parseFloat(
    ethers.utils.formatEther(feeData.toString()).toString()
  );
  priceData = await contract.getLatestPrice(parseInt(predictionId!.toString()));

  const price =
    parseInt(priceData[0].toString()) / 10 ** parseInt(priceData[1].toString());

  const predictions = predictionsData.filter((item: any, i: number) => {
    if (i >= startingNumber) {
      return item;
    }
  });

  const decimals = parseInt(priceData[1].toString());

  const data: any[] = predictions.map((item: any) => ({
    predictedValue: parseFloat(item.predictedValue.toString()) / 10 ** decimals,
    predictedAt: parseFloat(item.predictedAt.toString()),
    difference: parseFloat(item.difference.toString()),
    user: item.user.toString(),
  }));

  const gasLimit = (await provider.getBlock("latest")).gasLimit;

  return {
    props: {
      data,
      contestId: predictionId,
      price,
      decimals,
      entranceFee: fee,
    },
  };
};
