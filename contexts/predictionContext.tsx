/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getPredictionContract } from "../utils/helper-functions";

type PredictionContext = {
  isTimeUp: boolean;
  //   setIsTimeUp: React.Dispatch<React.SetStateAction<boolean>>;
};

type provider = {
  children: React.ReactNode;
};

export const predictionContext = React.createContext<PredictionContext>(
  {} as PredictionContext
);

function PredictionContextProvider({ children }: provider) {
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const { chainId: chainHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex!);
  const value = { isTimeUp };

  const listenForResult = async () => {
    const contract = await getPredictionContract("provider", chainId);

    await new Promise<void>(async (resolve, reject) => {
      contract?.once("ResultAnnounced", async () => {
        try {
          console.log("Announcing Result");

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  listenForResult();

  useEffect(() => {
    listenForResult();
  }, []);

  return (
    <predictionContext.Provider value={value}>
      {children}
    </predictionContext.Provider>
  );
}

export default PredictionContextProvider;
