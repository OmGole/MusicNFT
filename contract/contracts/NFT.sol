pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";



contract NFT is ERC721URIStorage {

    address payable owner;
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _tokenIds;

    uint256 listPrice = 0.01 ether;

    constructor() public ERC721("Music NFT", "MFT") {
        owner = payable(msg.sender);
    }

    struct ListedNFT {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        address payable artist;
        uint256 price;
        bool listed;
    }

    mapping(uint256 => ListedNFT) private list;

    function createToken(uint256 price, string memory tokenURI)
        public
        returns (uint256)
    {
        // require(msg.value == listPrice,"Send enough ether to list");
        require(price >= 0,"Please enter a valid value");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        listToken(newItemId,price);
        return newItemId;
    }

    function getListingPrice() public view returns (uint256) {
      return listPrice;
    }

    function listToken(uint256 tokenID,uint256 price) public {
      if(list[tokenID].owner != address(0)) {
        list[tokenID].price = price;
        list[tokenID].listed = true;
      } else {
        list[tokenID] = ListedNFT(
        tokenID,
        payable(address(this)),
        payable(msg.sender),
        payable(msg.sender),
        price,
        true
      );
      }
      _transfer(msg.sender,address(this),tokenID);
    }

    function unlistToken(uint256 tokenID) public {
      require(list[tokenID].seller == msg.sender,"You are not the owner");
      list[tokenID].listed = false;
      _transfer(address(this), msg.sender, tokenID);
    }

    function buy(uint256 tokenID) public payable {
      uint256 price = list[tokenID].price;
      require(msg.value == price + listPrice,"Not enough ether");

      address seller = list[tokenID].seller;
      address artist = list[tokenID].artist;

      list[tokenID].seller = payable(msg.sender);
      list[tokenID].listed = false;

      _transfer(address(this),msg.sender,tokenID);
      approve(address(this),tokenID);

      payable(owner).transfer(listPrice);
      uint256 left = msg.value - listPrice;

      payable(seller).transfer(left.mul(9).div(10));
      payable(artist).transfer(left.div(10));
    }

    function getAllNFTs() public view returns(ListedNFT[] memory) {
      uint256 total = _tokenIds.current();
      uint256 currentIndex = 0;
      ListedNFT[] memory nfts = new ListedNFT[](total);
      for(uint i=0;i<total;i++) {
          nfts[currentIndex] = list[i+1]; 
          currentIndex+=1;
      }
      return nfts;
    }

    function getMyNFTs() public view returns(ListedNFT[] memory) {
      uint256 total = _tokenIds.current();
      uint256 count = 0;
      uint256 currentIndex = 0;

      for(uint i=0;i < total;i++) {
        if(list[i+1].seller == msg.sender) {
          count+=1;
        }
      }

      ListedNFT[] memory nfts = new ListedNFT[](count);
      for(uint i=0;i<total;i++) {
        if(list[i+1].seller == msg.sender) {
          nfts[currentIndex] = list[i+1]; 
          currentIndex+=1;
        }
      }
      return nfts;
    }


  //   function withdrawFunds() public onlyOwner {
  //   uint256 balance =  address(this).balance;
  //   require(balance > 0, "NFTMarket: balance is zero");
  //   payable(msg.sender).transfer(balance); 
  // }
}