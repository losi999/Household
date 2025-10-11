import { NativeDateAdapter } from '@angular/material/core';

export class CalendarDateAdapter extends NativeDateAdapter {
  override format(date: Date): string {
    if (!date) {return '';}

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
    };

    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }
}
