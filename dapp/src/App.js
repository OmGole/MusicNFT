import { useEffect, useState } from "react";
import Modal from "react-modal";
import useConnect from "./hooks/useConnect";
import useContract from "./hooks/useContract";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata";
import NFT from "./NFT"
import {ethers} from 'ethers';

Modal.setAppElement("#root");

function App() {
  const { nft } = useContract();
  const contract = nft;
  const { connect, account } = useConnect();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audioNft, setAudioNft] = useState("");
  const [imageNft, setImageNft] = useState("");
  const [genre, setGenre] = useState("");
  const [price, setPrice] = useState();
  const [visible, setVisible] = useState(false);
  const [nfts, setNfts] = useState();
  const [allNfts, setAllNfts] = useState();

  const handleOpen = (e) => {
    e.preventDefault();
    setVisible(true);
  };

  useEffect(() => {
    connect();
  }, []);

  const handleImage = async (e) => {
    const imageResponse = await uploadFileToIPFS(e.target.files[0]);
    setImageNft(imageResponse.pinataURL);
    console.log(imageNft.pinataURL);
  };

  const handleAudio = async (e) => {
    const audioResponse = await uploadFileToIPFS(e.target.files[0]);
    setAudioNft(audioResponse.pinataURL);
    console.log(audioNft.pinataURL);
  };

  const handleMint = async (e) => {
    e.preventDefault();
    const nftMetadata = {
      name,
      description,
      genre,
      imageNft,
      audioNft,
    };

    const metadataResponse = await uploadJSONToIPFS(nftMetadata);
    console.log(metadataResponse.pinataURL);
    const ethPrice = ethers.utils.parseUnits(price, 'ether')
    const tokenId = await nft.createToken(ethPrice, metadataResponse.pinataURL);
    console.log(tokenId);

    setVisible(false);
    setName("");
    setDescription("");

    setGenre("");
    setPrice("");
    setAudioNft("");
    setImageNft("");
  };

  

  useEffect(() => {
    const getNFTS = async () => {
      const data = await nft.getMyNFTs();
      setNfts(data);
      const data2= await nft.getAllNFTs();
      setAllNfts(data2);
    }
    getNFTS();
  },[]);
  
  useEffect(() => {
    console.log(allNfts);
  },[allNfts]);



  return (
    <div className="App">
      <button onClick={handleOpen}>Mint nft</button>
      <h2>All NFTs</h2>
      <div className="flex">

      {allNfts?.map(nft => <NFT nft={nft} contract={contract} account={account}/>)}
      </div>
      

      <h2>My NFTs</h2>
      <div className="flex">
      {nfts?.map(nft => <NFT nft={nft} contract={contract} account={account}/>)}

      </div>

      <Modal isOpen={visible} onRequestClose={() => setVisible(false)}>
        <form>
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
          </div>
          <div>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label>Image: </label>
            <input type="file" onChange={handleImage}></input>
          </div>
          <div>
            <label>Audio: </label>
            <input type="file" onChange={handleAudio}></input>
          </div>
          <div>
            <input
              type="text"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            ></input>
          </div>
          <div>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            ></input>
          </div>
          <div>wallet:{account}</div>
          <button
            onClick={handleMint}
            disabled={imageNft === "" || audioNft === "" ? true : false}
          >
            Submit
          </button>
        </form>
      </Modal>

      <div></div>
    </div>
  );
}

export default App;
