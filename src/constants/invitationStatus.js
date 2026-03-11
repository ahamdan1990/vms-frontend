/**
 * Invitation status constants matching the backend's JSON camelCase enum serialization.
 * The backend uses JsonStringEnumConverter(JsonNamingPolicy.CamelCase), so all status
 * values come down as camelCase strings (e.g. "submitted", "underReview").
 */
export const InvitationStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  UnderReview: 'underReview',
  Approved: 'approved',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
  Expired: 'expired',
  Active: 'active',
  Completed: 'completed',
};

/**
 * Human-readable labels for invitation statuses
 */
export const InvitationStatusLabels = {
  [InvitationStatus.Draft]: 'Draft',
  [InvitationStatus.Submitted]: 'Submitted',
  [InvitationStatus.UnderReview]: 'Under Review',
  [InvitationStatus.Approved]: 'Approved',
  [InvitationStatus.Rejected]: 'Rejected',
  [InvitationStatus.Cancelled]: 'Cancelled',
  [InvitationStatus.Expired]: 'Expired',
  [InvitationStatus.Active]: 'Active',
  [InvitationStatus.Completed]: 'Completed',
};

/**
 * Tailwind CSS color classes for each status badge
 */
export const InvitationStatusColors = {
  [InvitationStatus.Draft]: 'bg-gray-100 text-gray-800',
  [InvitationStatus.Submitted]: 'bg-yellow-100 text-yellow-800',
  [InvitationStatus.UnderReview]: 'bg-blue-100 text-blue-800',
  [InvitationStatus.Approved]: 'bg-green-100 text-green-800',
  [InvitationStatus.Rejected]: 'bg-red-100 text-red-800',
  [InvitationStatus.Cancelled]: 'bg-gray-100 text-gray-600',
  [InvitationStatus.Expired]: 'bg-orange-100 text-orange-800',
  [InvitationStatus.Active]: 'bg-emerald-100 text-emerald-800',
  [InvitationStatus.Completed]: 'bg-purple-100 text-purple-800',
};
