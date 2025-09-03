
'use client';

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task, GroceryItem, User } from '@/types';
import {
  INITIAL_HOME_TASKS,
  INITIAL_CONDO_TASKS,
  INITIAL_HOME_GROCERIES,
  INITIAL_CONDO_GROCERIES,
  INITIAL_USERS,
} from './data';

export interface UserData {
  users: User[];
  homeTasks: Task[];
  condoTasks: Task[];
  homeGroceries: GroceryItem[];
  condoGroceries: GroceryItem[];
}

// Function to get a user's data document, creating it if it doesn't exist
export async function getUserData(userId: string): Promise<UserData> {
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    // Return existing user data
    return userDocSnap.data() as UserData;
  } else {
    // No document found, so create a new one with initial data
    const newUserData: UserData = {
      users: INITIAL_USERS,
      homeTasks: INITIAL_HOME_TASKS,
      condoTasks: INITIAL_CONDO_TASKS,
      homeGroceries: INITIAL_HOME_GROCERIES,
      condoGroceries: INITIAL_CONDO_GROCERIES,
    };
    await setDoc(userDocRef, newUserData);
    return newUserData;
  }
}

// Generic function to update a specific field in the user's document
async function updateUserDataField(
  userId: string,
  field: keyof UserData,
  data: any
) {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { [field]: data });
}


export const updateUserTasks = (userId: string, list: 'home' | 'condo', tasks: Task[]) => {
    const field: keyof UserData = list === 'home' ? 'homeTasks' : 'condoTasks';
    return updateUserDataField(userId, field, tasks);
}

export const updateUserGroceries = (userId: string, list: 'home' | 'condo', items: GroceryItem[]) => {
    const field: keyof UserData = list === 'home' ? 'homeGroceries' : 'condoGroceries';
    return updateUserDataField(userId, field, items);
}

export const updateUsers = (userId: string, users: User[]) => {
    return updateUserDataField(userId, 'users', users);
}
