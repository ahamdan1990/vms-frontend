import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectEmergencyContactsState = (state) => state.emergencyContacts;

// Basic selectors
export const selectEmergencyContactsList = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.list
);

export const selectEmergencyContactsTotal = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.total
);

export const selectCurrentVisitorId = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.currentVisitorId
);

export const selectCurrentContact = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.currentContact
);

// Loading selectors
export const selectEmergencyContactsLoading = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.loading
);

export const selectEmergencyContactsListLoading = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.listLoading
);

export const selectEmergencyContactsCreateLoading = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.createLoading
);

export const selectEmergencyContactsUpdateLoading = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.updateLoading
);

export const selectEmergencyContactsDeleteLoading = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.deleteLoading
);

// Error selectors
export const selectEmergencyContactsError = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.error
);

export const selectEmergencyContactsListError = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.listError
);

export const selectEmergencyContactsCreateError = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.createError
);

export const selectEmergencyContactsUpdateError = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.updateError
);

export const selectEmergencyContactsDeleteError = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.deleteError
);

// Selection selectors
export const selectSelectedContacts = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.selectedContacts
);

// Modal selectors
export const selectShowCreateModal = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.showCreateModal
);

export const selectShowEditModal = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.showEditModal
);

export const selectShowDeleteModal = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.showDeleteModal
);

// Computed selectors with business logic

// Sorted contacts by priority (primary first, then by priority number)
export const selectSortedEmergencyContacts = createSelector(
  [selectEmergencyContactsList],
  (contacts) => {
    return [...contacts].sort((a, b) => {
      // Primary contact always first
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      
      // Then by priority (lower number = higher priority)
      const priorityA = a.priority || 999;
      const priorityB = b.priority || 999;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Finally by name
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
);

// Get primary emergency contact
export const selectPrimaryEmergencyContact = createSelector(
  [selectEmergencyContactsList],
  (contacts) => {
    return contacts.find(contact => contact.isPrimary) || null;
  }
);

// Get active emergency contacts only
export const selectActiveEmergencyContacts = createSelector(
  [selectEmergencyContactsList],
  (contacts) => {
    return contacts.filter(contact => contact.isActive !== false);
  }
);

// Get emergency contact by ID
export const selectEmergencyContactById = createSelector(
  [selectEmergencyContactsList, (state, id) => id],
  (contacts, id) => {
    return contacts.find(contact => contact.id === id);
  }
);

// Contacts grouped by relationship
export const selectContactsByRelationship = createSelector(
  [selectSortedEmergencyContacts],
  (contacts) => {
    const grouped = {};
    
    contacts.forEach(contact => {
      const relationship = contact.relationship || 'Other';
      if (!grouped[relationship]) {
        grouped[relationship] = [];
      }
      grouped[relationship].push(contact);
    });

    return grouped;
  }
);

// Selection state helpers
export const selectIsContactSelected = createSelector(
  [selectSelectedContacts, (state, id) => id],
  (selectedIds, id) => {
    return selectedIds.includes(id);
  }
);

export const selectHasSelectedContacts = createSelector(
  [selectSelectedContacts],
  (selectedIds) => selectedIds.length > 0
);

export const selectSelectedContactsCount = createSelector(
  [selectSelectedContacts],
  (selectedIds) => selectedIds.length
);

export const selectSelectedContactsData = createSelector(
  [selectEmergencyContactsList, selectSelectedContacts],
  (contacts, selectedIds) => {
    return contacts.filter(contact => selectedIds.includes(contact.id));
  }
);

// Business logic selectors
export const selectCanCreateContact = createSelector(
  [selectEmergencyContactsCreateLoading],
  (createLoading) => !createLoading
);

export const selectCanDeleteSelectedContacts = createSelector(
  [selectHasSelectedContacts, selectEmergencyContactsDeleteLoading],
  (hasSelected, deleteLoading) => hasSelected && !deleteLoading
);

// Validation selectors
export const selectHasPrimaryContact = createSelector(
  [selectActiveEmergencyContacts],
  (contacts) => {
    return contacts.some(contact => contact.isPrimary);
  }
);

export const selectContactsWithPhone = createSelector(
  [selectActiveEmergencyContacts],
  (contacts) => {
    return contacts.filter(contact => contact.phoneNumber);
  }
);

export const selectContactsWithEmail = createSelector(
  [selectActiveEmergencyContacts],
  (contacts) => {
    return contacts.filter(contact => contact.email);
  }
);

// Statistics selectors
export const selectEmergencyContactStats = createSelector(
  [selectEmergencyContactsList],
  (contacts) => {
    const total = contacts.length;
    const active = contacts.filter(c => c.isActive !== false).length;
    const primary = contacts.filter(c => c.isPrimary).length;
    const withPhone = contacts.filter(c => c.phoneNumber).length;
    const withEmail = contacts.filter(c => c.email).length;
    
    // Group by relationship
    const byRelationship = {};
    contacts.forEach(contact => {
      const relationship = contact.relationship || 'Other';
      byRelationship[relationship] = (byRelationship[relationship] || 0) + 1;
    });
    
    return {
      total,
      active,
      inactive: total - active,
      primary,
      withPhone,
      withEmail,
      byRelationship,
      completionRate: total > 0 ? Math.round((withPhone / total) * 100) : 0
    };
  }
);

// Data freshness selectors
export const selectEmergencyContactsLastUpdated = createSelector(
  [selectEmergencyContactsState],
  (emergencyContacts) => emergencyContacts.lastUpdated
);

// Contact validation helpers
export const selectContactValidation = createSelector(
  [selectCurrentContact],
  (contact) => {
    if (!contact) return null;
    
    const errors = {};
    
    if (!contact.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!contact.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!contact.relationship?.trim()) {
      errors.relationship = 'Relationship is required';
    }
    
    if (!contact.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    // Email validation if provided
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = 'Valid email address is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
);

// Priority helpers
export const selectAvailablePriorities = createSelector(
  [selectEmergencyContactsList, selectCurrentContact],
  (contacts, currentContact) => {
    const usedPriorities = contacts
      .filter(c => c.id !== currentContact?.id && c.priority)
      .map(c => c.priority);
    
    const available = [];
    for (let i = 1; i <= 10; i++) {
      if (!usedPriorities.includes(i)) {
        available.push(i);
      }
    }
    
    return available;
  }
);

// Emergency contact summary for display
export const selectEmergencyContactSummary = createSelector(
  [selectPrimaryEmergencyContact, selectActiveEmergencyContacts],
  (primary, allActive) => {
    if (!primary && allActive.length === 0) {
      return {
        status: 'missing',
        message: 'No emergency contacts configured',
        urgency: 'high'
      };
    }
    
    if (!primary) {
      return {
        status: 'incomplete',
        message: 'No primary emergency contact designated',
        urgency: 'medium',
        count: allActive.length
      };
    }
    
    return {
      status: 'complete',
      message: `${allActive.length} emergency contact${allActive.length !== 1 ? 's' : ''} configured`,
      urgency: 'low',
      primary: primary,
      count: allActive.length
    };
  }
);