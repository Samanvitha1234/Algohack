import React, { createContext, useContext, useEffect, useState } from "react";
import peraWallet from "../utils/peraWallet";

type WalletContextType = {
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType>({
  account: null,
  connect: async () => {},
  disconnect: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connect = async () => {
    try {
      const accounts = await peraWallet.connect();
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Pera Wallet connection error:", err);
      alert("Could not connect to Pera Wallet. Is it installed and unlocked?");
    }
  };

  const disconnect = () => {
    peraWallet.disconnect();
    setAccount(null);
  };

  useEffect(() => {
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    });
  }, []);

  return (
    <WalletContext.Provider value={{ account, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
