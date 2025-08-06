import React from 'react';
import { testPagination, testAuditLogsPagination } from './paginationTest';

const PaginationDebugger = () => {
  const runTests = async () => {
    console.log('🚀 Starting Pagination Debug Tests...');
    await testPagination();
    await testAuditLogsPagination();
    console.log('✅ Debug Tests Complete - Check console for results');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 1000,
      background: 'red',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px'
    }}>
      <button onClick={runTests} style={{ 
        background: 'white', 
        color: 'red', 
        border: 'none', 
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer'
      }}>
        🐛 Run Pagination Debug Test
      </button>
    </div>
  );
};

export default PaginationDebugger;