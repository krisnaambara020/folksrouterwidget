import { PROVIDER_ID, WalletClient, useWallet } from "@txnlab/use-wallet";
import { createContext, useState } from "react";
import { TokenObject } from "../constants/TokenList";


export const GlobalContext = createContext({});

const GlobalContextProvider = ({ children }: any) => {

    const [userAssets, setUserAssets] = useState();
    const {
        providers,
        activeAddress,
        signTransactions,
        sendTransactions,
        connectedAccounts,
        connectedActiveAccounts,
        activeAccount,
        clients,
        isActive
    } = useWallet()


    const getClient = (id?: PROVIDER_ID): WalletClient => {
        if (!id) throw new Error('Provider ID is missing.')

        const walletClient = clients?.[id]
        console.log("Wallet Client", walletClient, connectedAccounts, activeAccount, connectedActiveAccounts);

        if (!walletClient) throw new Error(`Client not found for ID: ${id}`)

        return walletClient
    }
    const getAccountInfo = async () => {
        if (!activeAccount) throw new Error('No selected account.')

        const walletClient = getClient(activeAccount.providerId)

        const accountInfo = await walletClient?.getAccountInfo(activeAccount.address)

        console.log("Account info", accountInfo, walletClient);

        return accountInfo
    }

    const getAssets = async () => {
        if (!activeAccount) throw new Error('No selected account.')

        const walletClient = getClient(activeAccount.providerId)

        const accountInfo = await getAccountInfo();

        const asset = await walletClient?.getAssets(activeAccount.address);
        console.log("walletClient info", asset, accountInfo);

        let algoAsset;
        if (accountInfo) {
            algoAsset = {
                amount: accountInfo.amount,
                'asset-id': 0,
                'is-frozen': false
            };
        }

        const totalAssets = [algoAsset, ...asset];

        const TokensObject = Object.keys(TokenObject);

        let AssetsOfUser;
        if (totalAssets) {
            AssetsOfUser = totalAssets.map((asset) => {
                const assetId = asset['asset-id'];
                console.log("Assetid", assetId);

                TokenObject[assetId]['amount'] = asset.amount;

                if (TokensObject.includes(assetId.toString())) {
                    return TokenObject[assetId];
                }


            })
        }
        console.log("AssetsOfUser in context", AssetsOfUser, TokenObject)
        // return await walletClient?.getAssets(activeAccount.address)
        return AssetsOfUser
    }


    return (
        <GlobalContext.Provider value={{
            userAssets,
            setUserAssets,
            getClient,
            getAssets
        }}>
            {children}
        </GlobalContext.Provider>
    )


}

export default GlobalContextProvider