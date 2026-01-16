// App User Types
export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppUserWithTenants extends AppUser {
  tenants: TenantWithRole[];
}

// Tenant Member Types
export interface TenantMember {
  id: string;
  tenantId: string;
  appUserId: string;
  role: TenantMemberRole;
  status: MembershipStatus;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  processedByType?: 'backend' | 'app';
  rejectionReason?: string;
  appUser?: AppUser;
  tenant?: Tenant;
}

export type TenantMemberRole = 'MEMBER' | 'ADMIN';
export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Tenant Types
export interface Tenant {
  id: string;
  code: string;
  name: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  settings?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantWithRole extends Tenant {
  role: TenantMemberRole;
  joinedAt: string;
}

// Elder Types
export interface Elder {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photo?: string;
  notes?: string;
  status: ElderStatus;
  inactiveThresholdHours: number;
  lastActivityAt?: string;
  lastSeenLocation?: any;
  isActive: boolean;
  device?: Device;
  tenant?: Tenant;
  createdAt: string;
  updatedAt: string;
}

export type ElderStatus = 'ACTIVE' | 'INACTIVE' | 'HOSPITALIZED' | 'DECEASED' | 'MOVED_OUT';

// Device Types
export interface Device {
  id: string;
  tenantId?: string;
  elderId?: string;
  macAddress: string;
  uuid?: string;
  major?: number;
  minor?: number;
  deviceName?: string;
  type: DeviceType;
  batteryLevel?: number;
  lastSeen?: string;
  lastRssi?: number;
  isActive: boolean;
  elder?: Elder;
  tenant?: Tenant;
}

export type DeviceType = 'IBEACON' | 'EDDYSTONE' | 'GENERIC_BLE';

// Gateway Types
export interface Gateway {
  id: string;
  tenantId: string;
  serialNumber: string;
  name: string;
  location?: string;
  type: GatewayType;
  latitude?: number;
  longitude?: number;
  deviceInfo?: any;
  isActive: boolean;
  tenant?: Tenant;
}

export type GatewayType = 'GENERAL' | 'BOUNDARY' | 'MOBILE';

// Alert Types
export interface Alert {
  id: string;
  tenantId: string;
  elderId: string;
  gatewayId?: string;
  type: AlertType;
  status: AlertStatus;
  severity: AlertSeverity;
  title: string;
  message: string;
  details?: any;
  latitude?: number;
  longitude?: number;
  triggeredAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  acceptedBy?: string;
  acceptedAt?: string;
  elder?: Elder;
  gateway?: Gateway;
  tenant?: Tenant;
  assignments?: AlertAssignment[];
}

export interface AlertAssignment {
  id: string;
  alertId: string;
  appUserId: string;
  isAccepted: boolean;
  acceptedAt?: string;
  appUser?: AppUser;
}

export type AlertType = 'BOUNDARY' | 'INACTIVE' | 'FIRST_ACTIVITY' | 'LOW_BATTERY' | 'EMERGENCY';
export type AlertStatus = 'PENDING' | 'NOTIFIED' | 'RESOLVED' | 'DISMISSED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Location Log Types
export interface LocationLog {
  id: string;
  elderId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  activity?: string;
  address?: string;
  sourceType?: string;
  sourceLogId?: string;
  sourceGatewayId?: string;
  timestamp: string;
  createdAt: string;
}

// Push Token Types
export interface PushToken {
  id: string;
  appUserId: string;
  token: string;
  deviceInfo?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AppUser;
}
