import { ethers } from "ethers"
import tailwindcss from 'tailwindcss';

document.getElementById('uploadButton')!.addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (!fileInput.files?.length) {
    alert('Please select a file first');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const fileContent = event.target?.result as string;
    
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(fileContent);

    console.log('File content:', fileContent);
    // console.log('Signature:', signature);

    // const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_PROVIDER');
    // const contract = new ethers.Contract('YOUR_CONTRACT_ADDRESS', contractAbi, wallet);
    // await contract.yourContractMethod(fileContent, signature);

  };

  reader.readAsText(file);
});