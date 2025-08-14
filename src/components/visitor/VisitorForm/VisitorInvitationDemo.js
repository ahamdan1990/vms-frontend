// Demo component showing the new visitor + invitation creation workflow
import React, { useState } from 'react';
import VisitorForm from '../VisitorForm/VisitorForm';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';

const VisitorInvitationDemo = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (visitorData, invitationData) => {
    // Simulate API calls
    console.log('🧑 Creating Visitor:', visitorData);
    
    if (invitationData) {
      console.log('📅 Creating Invitation:', invitationData);
      setResult({
        type: 'both',
        visitor: visitorData,
        invitation: invitationData
      });
    } else {
      setResult({
        type: 'visitor_only',
        visitor: visitorData
      });
    }
    
    setShowDemo(false);
  };

  const handleCancel = () => {
    setShowDemo(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Visitor + Invitation Creation Demo
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            ✨ New Feature: Create Invitation During Visitor Registration
          </h2>
          <p className="text-blue-800 mb-4">
            Staff can now create an invitation immediately after registering a new visitor, 
            streamlining the workflow for immediate visit scheduling.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-900">Features:</h3>
              <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
                <li>Optional invitation creation toggle</li>
                <li>Full invitation form integration</li>
                <li>Date/time validation</li>
                <li>Location and purpose selection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Benefits:</h3>
              <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
                <li>Streamlined workflow</li>
                <li>Reduced data entry</li>
                <li>Immediate visit scheduling</li>
                <li>Better user experience</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <Button
            onClick={() => setShowDemo(true)}
            size="lg"
            className="px-8 py-3"
          >
            🚀 Try the New Workflow
          </Button>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ✅ {result.type === 'both' ? 'Visitor & Invitation Created!' : 'Visitor Created!'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-800">Visitor Details:</h4>
                <div className="text-sm text-green-700 mt-1">
                  <p><strong>Name:</strong> {result.visitor.firstName} {result.visitor.lastName}</p>
                  <p><strong>Email:</strong> {result.visitor.email}</p>
                  <p><strong>Company:</strong> {result.visitor.company || 'Not specified'}</p>
                </div>
              </div>
              
              {result.invitation && (
                <div>
                  <h4 className="font-medium text-green-800">Invitation Details:</h4>
                  <div className="text-sm text-green-700 mt-1">
                    <p><strong>Subject:</strong> {result.invitation.subject}</p>
                    <p><strong>Start:</strong> {new Date(result.invitation.scheduledStartTime).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(result.invitation.scheduledEndTime).toLocaleString()}</p>
                    <p><strong>Type:</strong> {result.invitation.type} Visitor</p>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResult(null)}
              className="mt-4"
            >
              Clear Result
            </Button>
          </div>
        )}

        <Modal
          isOpen={showDemo}
          onClose={handleCancel}
          title="Create New Visitor"
          size="full"
        >
          <VisitorForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={false}
            isEdit={false}
          />
        </Modal>

        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            This demo shows the new integrated workflow. In the real application, 
            this feature is available when creating visitors from the Visitors page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisitorInvitationDemo;
