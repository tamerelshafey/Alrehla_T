const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');
code = code.replace(
`export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  customizationData?: {
    childName?: string;
    childPhotoUrl?: string;
    coverChoice?: string;
    notes?: string;
  };
}`,
`export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  customizationData?: {
    recipientType?: 'self' | 'child';
    childId?: string;
    childName?: string;
    childPhotoUrl?: string;
    coverChoice?: string;
    notes?: string;
  };
}`);
code = code.replace(
`export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  dependentParticipantId?: string;
  independentParticipantId?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  transactionReference?: string;
};`,
`export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  transactionReference?: string;
};`);
code = code.replace(
`export interface CourseSubscription {
  id: string;
  packageId: string;
  guardianProfileId?: string;
  dependentParticipantId?: string;
  independentParticipantId?: string;
  status: CourseSubscriptionStatus;
  startedAt: string;
  createdAt: string;
}`,
`export interface CourseSubscription {
  id: string;
  packageId: string;
  userId: string;
  participantType: 'self' | 'child';
  childId?: string;
  status: CourseSubscriptionStatus;
  startedAt: string;
  createdAt: string;
}`);

// Add ChildProfile and Session
code = code + `
export interface ChildProfile {
  id: string;
  userProfileId: string;
  name: string;
  age: number;
  createdAt: string;
}

export interface Session {
  id: string;
  courseSubscriptionId: string;
  instructorId?: string;
  sessionNumber: number;
  scheduledAt: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
`;

fs.writeFileSync('src/types/index.ts', code);
