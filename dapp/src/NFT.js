import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import {ethers} from 'ethers';
import Big from 'big.js';

function NFT({ nft, contract, account}) {
  const [current, setCurrent] = useState();
  const [price, setPrice] = useState();

  useEffect(() => {
    const getCurrentNft = async () => {
      const data = await contract.tokenURI(nft.tokenId);
      const current = await axios.get(data);
      setCurrent(current.data);
    };
    getCurrentNft();
  }, [nft]);

  const handleBuy = async (e) => {
    e.preventDefault();
    const listPrice = await contract.getListingPrice();
    const ethPrice = ethers.utils.parseUnits(new Big(ethers.utils.formatEther( nft.price )).add(ethers.utils.formatEther(listPrice)).toString(), 'ether')
    const transaction = await contract.buy(nft.tokenId.toNumber(),{value:ethPrice, gasLimit: 3e7});
    await transaction.wait();
    alert("Bought NFT")
  }
  
  const handleUnlist = async (e) => {
    e.preventDefault();
    console.log("Unlist")
    await contract.unlistToken(nft.tokenId.toNumber());
    alert("Listed NFT");
  }
  
  const handleList = async (e) => {
    e.preventDefault();
    const ethPrice = ethers.utils.parseUnits(price, 'ether')
    await contract.listToken(nft.tokenId.toNumber(),ethPrice);
    alert("Listed NFT");
  }



  return (
    
    <div className="">
      <img src={current?.imageNft} className="w-[100px]" />
      <h3>Name:{current?.name}</h3>
      <p>Desc: {current?.description}</p>
      <h3>Genre:{current?.genre}</h3>
      <h3>Price:{ethers.utils.formatEther( nft.price )}</h3>
      <h3>Listed: {nft?.listed ? "true" : "false"}</h3>
      <ReactAudioPlayer src={current?.audioNft} controls />
      {nft.listed === false ? "This NFT is not for sale" : (nft.seller.toLowerCase() === account ? "You are the owner" : <button className="mr-5" onClick={handleBuy}>Buy</button>)} 
      {nft.seller.toLowerCase() === account && (nft.listed === true ? <button onClick={handleUnlist}>Unlist</button> : <div>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}/>
        <button onClick={handleList}>List</button>
      </div>)}
    </div>
  );
}

export default NFT;
