import { User } from '@household/shared/types/types';
import { createFeatureSelector } from '@ngrx/store';

export const selectUsers = createFeatureSelector<User.Response[]>('users');
