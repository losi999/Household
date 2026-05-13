import { signalStore } from '@ngrx/signals';
import { withAuthEvents } from './with-auth-events';

export const AuthStore = signalStore({
  providedIn: 'root',
},
withAuthEvents(),
);
