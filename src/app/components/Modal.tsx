// components/Modal.js
const Modal = ({ isOpen, onClose, wasmHash, contractID }) => {
    if (!isOpen) {
      return null;
    }
  
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h2> Contract deployed! </h2>
          <br />
          <h3>WASM hash: {wasmHash}</h3>
          <h3>Contract ID: {contractID}</h3>
          <div className="modal-actions">
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default Modal;
  