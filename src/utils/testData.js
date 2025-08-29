// src/utils/testData.js
/**
 * Test data for debugging escalation rules pagination
 */

export const generateMockEscalationRules = (count = 50) => {
  const mockRules = [];
  
  const alertTypes = ['VisitorArrival', 'BlacklistAlert', 'SystemAlert', 'EmergencyAlert', 'VisitorOverstay'];
  const priorities = ['Low', 'Medium', 'High', 'Critical', 'Emergency'];
  const actions = ['EscalateToRole', 'SendEmail', 'SendSMS', 'EscalateToUser'];
  const roles = ['Staff', 'Operator', 'Administrator', 'Security'];
  
  for (let i = 1; i <= count; i++) {
    mockRules.push({
      id: i,
      ruleName: `Test Rule ${i}`,
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      alertPriority: priorities[Math.floor(Math.random() * priorities.length)],
      targetRole: Math.random() > 0.5 ? roles[Math.floor(Math.random() * roles.length)] : '',
      escalationDelayMinutes: Math.floor(Math.random() * 60) + 1,
      action: actions[Math.floor(Math.random() * actions.length)],
      escalationTargetRole: roles[Math.floor(Math.random() * roles.length)],
      maxAttempts: Math.floor(Math.random() * 5) + 1,
      isEnabled: Math.random() > 0.3,
      rulePriority: Math.floor(Math.random() * 10) + 1,
      createdOn: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedOn: new Date().toISOString()
    });
  }
  
  return mockRules;
};

export const getMockPaginatedResponse = (pageIndex = 0, pageSize = 20, totalItems = 50) => {
  const allItems = generateMockEscalationRules(totalItems);
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const items = allItems.slice(startIndex, endIndex);
  
  return {
    items,
    totalCount: totalItems,
    pageIndex,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
    hasNextPage: endIndex < totalItems,
    hasPreviousPage: pageIndex > 0
  };
};

export default {
  generateMockEscalationRules,
  getMockPaginatedResponse
};
