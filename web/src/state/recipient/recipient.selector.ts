import { Recipient } from '@household/shared/types/types';
import { createFeatureSelector } from '@ngrx/store';

export const selectRecipients = createFeatureSelector<Recipient.Response[]>('recipients');
