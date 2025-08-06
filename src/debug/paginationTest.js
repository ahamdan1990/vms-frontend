// Debug script to test pagination issues
import auditService from '../services/auditService';

const testPagination = async () => {
  console.log('🔍 Testing Audit Pagination...');
  
  try {
    // Test first few pages
    for (let pageIndex = 0; pageIndex < 5; pageIndex++) {
      console.log(`\n📄 Testing Page ${pageIndex + 1} (pageIndex: ${pageIndex})`);
      
      const response = await auditService.getUserActivity({
        pageIndex: pageIndex,
        pageSize: 20
      });
      
      console.log(`✅ Page ${pageIndex + 1} Results:`, {
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        itemsReceived: response.items?.length || 0,
        firstItem: response.items?.[0]?.timestamp,
        lastItem: response.items?.[response.items?.length - 1]?.timestamp
      });

      if (!response.items || response.items.length === 0) {
        console.warn(`⚠️ No data on page ${pageIndex + 1}`);
      }
    }
    
    // Test higher page numbers that are failing
    console.log('\n🔍 Testing Higher Page Numbers...');
    for (let pageIndex = 6; pageIndex < 9; pageIndex++) {
      try {
        console.log(`\n📄 Testing Page ${pageIndex + 1} (pageIndex: ${pageIndex})`);
        
        const response = await auditService.getUserActivity({
          pageIndex: pageIndex,
          pageSize: 20
        });
        
        console.log(`✅ Page ${pageIndex + 1} Results:`, {
          totalCount: response.totalCount,
          totalPages: response.totalPages,
          pageIndex: response.pageIndex,
          pageSize: response.pageSize,
          itemsReceived: response.items?.length || 0,
          firstItem: response.items?.[0]?.timestamp,
          lastItem: response.items?.[response.items?.length - 1]?.timestamp
        });

        if (!response.items || response.items.length === 0) {
          console.error(`❌ ISSUE FOUND: Page ${pageIndex + 1} has no data but totalPages suggests it should!`);
        }
      } catch (error) {
        console.error(`❌ Error on page ${pageIndex + 1}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Pagination test failed:', error);
  }
};

// Also test regular audit logs
const testAuditLogsPagination = async () => {
  console.log('\n🔍 Testing General Audit Logs Pagination...');
  
  try {
    const response = await auditService.getAuditLogs({
      pageIndex: 0,
      pageSize: 20
    });
    
    console.log('📊 Audit Logs Summary:', {
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      pageIndex: response.pageIndex,
      pageSize: response.pageSize,
      itemsReceived: response.items?.length || 0
    });
    
    // Test a higher page
    if (response.totalPages > 7) {
      const highPageResponse = await auditService.getAuditLogs({
        pageIndex: 7,
        pageSize: 20
      });
      
      console.log('📊 Audit Logs Page 8 (Index 7):', {
        totalCount: highPageResponse.totalCount,
        totalPages: highPageResponse.totalPages,
        pageIndex: highPageResponse.pageIndex,
        pageSize: highPageResponse.pageSize,
        itemsReceived: highPageResponse.items?.length || 0
      });
      
      if (!highPageResponse.items || highPageResponse.items.length === 0) {
        console.error('❌ ISSUE: High page number returns no data!');
      }
    }
    
  } catch (error) {
    console.error('❌ Audit logs pagination test failed:', error);
  }
};

export { testPagination, testAuditLogsPagination };