'use server';

import { getFamilyMembers, addFamilyMember } from '@/data/mock';

export async function fetchFamilyMembers() {
  return getFamilyMembers();
}

export async function createFamilyMember(name: string, age: number, gender: string) {
  return addFamilyMember(name, age, gender);
}
