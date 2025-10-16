import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

// Components
import CameraDetails from '../../../components/camera/CameraDetails/CameraDetails';

// Redux actions
import { fetchCameraById } from '../../../store/slices/camerasSlice';

// Utility functions
import { scrollToTop } from '../../../utils/scrollUtils';

/**
 * CameraDetailsPage - Detailed camera view page
 * Shows comprehensive camera information and management options
 */
const CameraDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCamera } = useSelector(state => state.cameras);

  // Page initialization
  useEffect(() => {
    scrollToTop();
  }, []);

  // Generate dynamic page title
  const pageTitle = currentCamera
    ? `${currentCamera.name} - Camera Details - VMS`
    : 'Camera Details - VMS';

  const pageDescription = currentCamera
    ? `View and manage ${currentCamera.name} camera. Monitor status, configure settings, and perform operations.`
    : 'View detailed camera information and management options.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`camera, ${currentCamera?.name || 'details'}, management, monitoring, configuration, VMS`} />
      </Helmet>
      
      <div className="camera-details-page">
        <CameraDetails />
      </div>
    </>
  );
};

export default CameraDetailsPage;