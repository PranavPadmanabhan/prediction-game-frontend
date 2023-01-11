import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import PredictionContextProvider from "../contexts/predictionContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <PredictionContextProvider>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </PredictionContextProvider>
    </MoralisProvider>
  );
}
