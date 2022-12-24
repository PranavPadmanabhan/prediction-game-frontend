/* eslint-disable @next/next/no-img-element */
import { ethers } from "ethers";
import React from "react";
import styles from "../styles/Home.module.css";

type Card = {
  name?: string;
  date?: string;
  onClick?: () => void;
  fee: any;
};

function PredictionCards({ date, name, onClick, fee }: Card) {
  return (
    <div
      className={`w-[75%] min-h-[250px] h-[90%] bg-white bg-card bg-no-repeat bg-center bg-cover rounded-lg shadow-card flex flex-col items-center justify-center overflow-hidden box-border hover:translate-y-2 hover:scale-105 duration-300`}
    >
      <div className="w-full h-full bg-overlay-black flex flex-col items-center justify-between p-1 box-border">
        <div className="w-full h-[50%] flex flex-col items-start justify-start p-2 box-border">
          <div className="text-[2rem] text-center text-transparent bg-clip-text bg-gradient-to-tr from-pink-500  to-blue-400 drop-shadow-3xl font-extrabold mt-3 ml-2">
            ETH - USD
          </div>
        </div>
        <div className="w-full h-[50%] flex flex-col items-end justify-end p-1 box-border">
          <h1 className="text-gray-300 font-light self-start">
            Prediction Fee: {fee} ETH
          </h1>
          <h1 className="text-gray-300 self-start font-light my-2">
            Participate for 12PM, May 20
          </h1>
          <button
            onClick={onClick}
            className="w-[50%] h-[50%] bg-gradient-to-tr from-pink-500  to-blue-400 max-h-[35px] max-w-[200px] rounded-md text-white"
          >
            Predict
          </button>
        </div>
      </div>
    </div>
  );
}

export default PredictionCards;
