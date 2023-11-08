import React, { useContext, useEffect } from 'react';
import InputTokenAmount from '../InputToken';
import SelectToken from '../SelectToken';
import { FaWallet } from "react-icons/fa";
import { Button, Flex, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import TokenModal from '../TokenModal';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { GlobalContext } from '../../context/GlobalContext';
import { useWallet } from '@txnlab/use-wallet';
import { SwapContext } from '../../context/SwapContext';
import TokenList, { I_TokenList, TokenObject } from '../../constants/TokenList';



const InputContainer = ({
    // filteredTokenList,
}: any) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [filteredTokenList, setFilteredTokenList] = React.useState(TokenList);

    const {
        clients,
        activeAccount
    } = useWallet()

    const { getAssets } = useContext(GlobalContext);

    const getUsersAssets = async () => {
        const usersAssets = await getAssets();

        console.log("User Assets", usersAssets, TokenList);

        const TokensObjectValues = Object.values(usersAssets);
        console.log("TokensObjectValues", TokensObjectValues);

        setFilteredTokenList(TokensObjectValues);

    }


    useEffect(() => {
        if (activeAccount) {
            getUsersAssets();
        }
    }, [activeAccount])



    const {
        tokenOne,
        tokenTwo,
        tokenOneAmount,
        tokenTwoAmount,
        selectedToken,
        setSelectedToken,
        setTokenOne,
        setTokenOneAmount,
        setTokenTwoAmount,
        getDataWhenTokensChanged,
        getTokenAmount
    } = React.useContext(SwapContext);


    const changeTokenOneAmount = async (value: any) => {

        const tokenAmount = value;
        setTokenOneAmount(tokenAmount);

        console.log("Inputs", tokenAmount, tokenOne, tokenTwo);

        const tokenOneDecimal = tokenOne?.assetDecimal;
        const tokenTwoDecimal = tokenTwo?.assetDecimal;

        const decimalTokenAmount = tokenAmount * (10 ** tokenOneDecimal);

        const quoteAmount = await getTokenAmount(decimalTokenAmount, tokenOne, tokenTwo, 'FIXED_INPUT');

        const fetchedAmount = quoteAmount / (10 ** tokenTwoDecimal);

        console.log("fetchedAmount in input", fetchedAmount);


        if (fetchedAmount) {
            setTokenTwoAmount(fetchedAmount);
        }

    }

    const handleTokenSelection = async (token: I_TokenList) => {
        setSelectedToken(token);
        setTokenOne(token);
        if (tokenOneAmount) {
            const outputTokenAmount = await getDataWhenTokensChanged(tokenOneAmount, token, 'FIXED_INPUT');
            if (outputTokenAmount) {
                setTokenTwoAmount(outputTokenAmount);
            }
        } else if (tokenTwoAmount) {
            const outputTokenAmount = await getDataWhenTokensChanged(tokenTwoAmount, token, 'FIXED_OUTPUT');

            if (outputTokenAmount) {
                setTokenOneAmount(outputTokenAmount);
            }
        }
    }

    const filterTokenList = () => {
        console.log("Selected token", selectedToken);
        const tokenlistFiltered = TokenList.filter((token: any) => (
            token !== selectedToken
        ))
        setFilteredTokenList(tokenlistFiltered);
    }

    React.useEffect(() => {
        console.log("Selected token in useEffect", selectedToken);
        filterTokenList();
    }, [selectedToken])


    return (

        <div>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg='#304256' w='425px' m='auto' borderRadius='15px' style={{ height: '500px' }}>
                    <ModalHeader color='#FFF' >
                        <Flex justify={'space-between'}>
                            Select Token
                            <IoIosCloseCircleOutline onClick={onClose} className="ui-w-[30px] ui-h-[30px] ui-cursor-pointer" />
                        </Flex>
                    </ModalHeader>

                    <ModalBody p={0}>
                        <TokenModal
                            tokenList={filteredTokenList}
                            handleTokenSelect={handleTokenSelection}
                            onClose={onClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <p className="ui-text-[16px] ui-text-gray-500">You Pay</p>
            <div className="ui-flex ui-bg-[#1E293B]  ui-border-gray-400 ui-border ui-px-4 ui-py-2 ui-rounded-xl ui-flex-col ui-gap-4">
                <div className="ui-flex ui-justify-between">

                    <InputTokenAmount
                        tokenAmount={tokenOneAmount}
                        changeTokenAmount={changeTokenOneAmount}
                        setTokenAmount={setTokenOneAmount}
                    />

                    <SelectToken
                        id={'1'}
                        openTokenModal={onOpen}
                        token={tokenOne}
                    />
                </div>

                <div className="ui-flex ui-flex-row ui-justify-between ui-text-gray-400">
                    <div className="">
                        <span className="ui-text-[20px]">$0</span>
                        <span className="ui-text-[14px]">.0</span>
                    </div>
                    <div className="ui-flex ui-flex-row ui-gap-[4px] ui-items-center">
                        <FaWallet />
                        <div>0.00</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputContainer;