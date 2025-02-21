// pages/index.tsx
import { useState } from 'react';
import NavBar from '../components/NavBar';
import Modal from '../components/Modal';

export default function Home() {
  const [textField, setTextField] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [wasmHash, setWasmHash] = useState('');
  const [contractID, setContractID] = useState('');

  const handleTextChange = (event) => {
    setTextField(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('textField', textField);

      try {
        const response = await fetch('/api/deployer', {
          method: 'POST',
          body: formData,
        });
        console.log(response.statusText);
        const body = await response.json();
        console.log(body);
        setWasmHash(body.wasmHash);
        setContractID(body.id);
        setModalOpen(true);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div>
        <NavBar />
      </div>
      <div className="container">
        <h2> Your private key </h2>
        <p> (its not logged or stored! 😉) </p>
        <input type="password" value={textField} onChange={handleTextChange} />
        <h2> Upload the wasm file </h2>
        <input type="file" onChange={handleFileChange} />
        {isLoading ? (
          <div className="spinner"></div> // Spinner element (Implementa tu propio spinner)
        ) : (
          <button onClick={handleSubmit} disabled={isLoading}>
            Deploy
          </button>
        )}
        <Modal isOpen={isModalOpen} onClose={closeModal} wasmHash={wasmHash} contractID={contractID} />
      </div>
    </>
  );
}
