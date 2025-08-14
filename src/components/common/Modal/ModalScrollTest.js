// Test component to verify modal scrolling works properly
import React, { useState } from 'react';
import Modal from './Modal';
import Button from '../Button/Button';

const ModalScrollTest = () => {
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const longContent = Array.from({ length: 50 }, (_, i) => (
    <div key={i} className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold">Section {i + 1}</h4>
      <p className="text-gray-600">
        This is a long content section to test modal scrolling behavior. 
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </div>
  ));

  const formContent = (
    <form className="space-y-6">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field {i + 1}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter value for field ${i + 1}`}
          />
        </div>
      ))}
    </form>
  );

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Modal Scroll Test</h2>
      
      <div className="space-x-4">
        <Button onClick={() => setShowSmallModal(true)}>
          Small Content Modal
        </Button>
        <Button onClick={() => setShowLargeModal(true)}>
          Large Content Modal (Should Scroll)
        </Button>
        <Button onClick={() => setShowFormModal(true)}>
          Large Form Modal
        </Button>
      </div>

      {/* Small Modal */}
      <Modal
        isOpen={showSmallModal}
        onClose={() => setShowSmallModal(false)}
        title="Small Modal"
        size="md"
      >
        <p>This is a small modal with minimal content. It should not scroll.</p>
      </Modal>

      {/* Large Content Modal */}
      <Modal
        isOpen={showLargeModal}
        onClose={() => setShowLargeModal(false)}
        title="Large Content Modal"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowLargeModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowLargeModal(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <div>
          <p className="mb-4 text-gray-600">
            This modal has a lot of content and should scroll within the modal body.
            The header and footer should remain fixed.
          </p>
          {longContent}
        </div>
      </Modal>

      {/* Large Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Large Form Modal"
        size="xl"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFormModal(false)}>
              Submit
            </Button>
          </div>
        }
      >
        <div>
          <p className="mb-6 text-gray-600">
            This form has many fields and should scroll properly while keeping the header and footer visible.
          </p>
          {formContent}
        </div>
      </Modal>
    </div>
  );
};

export default ModalScrollTest;
