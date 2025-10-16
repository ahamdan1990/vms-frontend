import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';

// Components
import CameraList from '../../../components/camera/CameraList/CameraList';

// Page metadata
import { PAGE_METADATA } from '../../../constants/pageMetadata';

// Utility functions
import { scrollToTop } from '../../../utils/scrollUtils';

/**
 * CamerasListPage - Main page for camera management
 * Provides comprehensive camera listing with CRUD operations
 */
const CamerasListPage = () => {
  const dispatch = useDispatch();

  // Page initialization
  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <Helmet>
        <title>Camera Management - VMS</title>
        <meta name="description" content="Manage and monitor cameras in the visitor management system. View camera status, configure settings, and perform maintenance operations." />
        <meta name="keywords" content="camera, management, surveillance, monitoring, configuration, VMS" />
      </Helmet>
      
      <div className="cameras-list-page">
        <CameraList />
      </div>
    </>
  );
};

export default CamerasListPage;