# Profile Management Documentation

This document describes the profile management functionality implemented in the ClientEventSide project.

## Overview

The profile management system allows users to view and update their personal information, manage notification preferences, and control security settings.

## Features

### 1. Profile Information Display
- **User Avatar**: Display user profile picture with fallback to initials
- **Basic Information**: Name, email, phone number
- **Account Status**: Role, verification status, account activity
- **Member Since**: Account creation date

### 2. Profile Editing
- **Inline Editing**: Toggle between view and edit modes
- **Real-time Validation**: Form validation with error handling
- **Auto-save**: Automatic saving of changes
- **Cancel Changes**: Ability to revert unsaved changes

### 3. Profile Settings
- **Notification Preferences**: Email, SMS, and marketing notifications
- **Security Settings**: Password change functionality
- **Account Management**: Account deletion with confirmation

## Database Schema

### Users Table Structure
Based on the provided table structure:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'buyer',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### 1. Get User Profile (`/api/profile` - GET)
Retrieves user profile information.

**Query Parameters:**
- `userId` (required): User UUID

**Response:**
```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+1234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "buyer",
    "email_verified": true,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Update User Profile (`/api/profile` - PUT)
Updates user profile information.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "name": "Updated Name",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "data": {
    "id": "user-uuid",
    "name": "Updated Name",
    "phone": "+1234567890",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

## Components

### 1. Profile Page (`/app/profile/page.tsx`)
Main profile page with the following features:
- User information display
- Edit mode toggle
- Profile picture with initials fallback
- Account status badges
- Navigation to settings

### 2. Profile Settings (`/app/profile/settings/page.tsx`)
Advanced settings page including:
- Notification preferences
- Security settings
- Account deletion

### 3. Profile Settings Component (`/components/profile-settings.tsx`)
Reusable component for profile settings with:
- Notification toggles
- Password change form
- Account deletion confirmation

## Navigation Integration

### Desktop Navigation (Sidebar)
- Profile link in main navigation menu
- User greeting in sidebar header
- Role badge display

### Mobile Navigation (Bottom Nav)
- Profile tab in bottom navigation
- Consistent icon and labeling

## Security Features

### 1. Input Validation
- Server-side validation for all profile updates
- Type checking for all input fields
- Sanitization of user input

### 2. Authentication
- User authentication required for all profile operations
- Session-based access control
- Proper error handling for unauthorized access

### 3. Data Protection
- Email addresses cannot be changed (security measure)
- Sensitive operations require confirmation
- Audit trail through updated_at timestamps

## Usage Examples

### 1. Viewing Profile
```tsx
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api'

const { user } = useAuth()
const { user: profile } = await apiClient.getUserProfile(user.id)
```

### 2. Updating Profile
```tsx
await apiClient.updateUserProfile(user.id, {
  name: 'New Name',
  phone: '+1234567890',
  avatar_url: 'https://example.com/avatar.jpg'
})
```

## Error Handling

### 1. Network Errors
- Graceful handling of network failures
- User-friendly error messages
- Retry mechanisms where appropriate

### 2. Validation Errors
- Real-time form validation
- Clear error messaging
- Field-specific error indicators

### 3. Server Errors
- Proper HTTP status code handling
- Fallback UI states
- Error logging for debugging

## Future Enhancements

### 1. Advanced Features
- Profile picture upload functionality
- Two-factor authentication
- Account activity logs
- Data export functionality

### 2. Social Features
- Public profile pages
- Profile sharing
- Social media integration

### 3. Customization
- Theme preferences
- Language settings
- Accessibility options

## Testing

### 1. Unit Tests
- Component rendering tests
- API client method tests
- Validation logic tests

### 2. Integration Tests
- Profile update flow tests
- Authentication integration tests
- Error handling tests

### 3. E2E Tests
- Complete profile management workflow
- Cross-browser compatibility
- Mobile responsiveness

## Deployment Considerations

### 1. Environment Variables
- Ensure proper Supabase configuration
- Set up appropriate CORS policies
- Configure rate limiting for API endpoints

### 2. Database Migrations
- Apply user table schema updates
- Set up proper indexes for performance
- Configure backup and recovery procedures

### 3. Monitoring
- Set up error tracking
- Monitor API performance
- Track user engagement metrics
