/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../components/Header";
import Modal from "../components/Modal";
import PredictionCards from "../components/PredictionCards";
import { getContractAddress, getTokenAddress } from "../utils/helper-functions";
import { abi } from "../constants/constants";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Home() {
  const [contests, setContests] = useState<any>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [id, setId] = useState<number>(1);
  const [fee, setfee] = useState<any>();

  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex!);

  const { runContractFunction: getFee } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getContests } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "getContests",
    params: {},
  });

  const { runContractFunction: getLatestTimeStamp } = useWeb3Contract({
    abi: abi,
    contractAddress: getContractAddress(chainId),
    functionName: "getLatestTimeStamp",
    params: {},
  });

  const updateUI = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        getContractAddress(chainId),
        abi,
        signer
      );
    }
  };

  const GetContest = async () => {
    const contests = await getContests();
    setContests(contests);
  };

  const GetContestFee = async () => {
    const price = await getFee();
    setfee(ethers.utils.formatEther(price!.toString()));
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
      GetContest();
      GetContestFee();
    }
  }, [isWeb3Enabled, account]);

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
      <Head>
        <title>Predict</title>
        <meta name="description" content="prediction game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="w-full h-[89vh] bg-transparent grid grid-cols-4 place-content-start place-items-center pt-[5%] pb-3 gap-y-[10%] mb-6 overflow-y-scroll scrollbar-hide">
        {contests.map((item: any, index: number) => (
          <PredictionCards
            onClick={() => {
              setId(item.id.toString());
              setShowModal(true);
            }}
            fee={fee}
            key={index}
          />
        ))}
      </div>
      <Modal id={id} setShowModal={setShowModal} showModal={showModal} />
    </div>
  );
}
