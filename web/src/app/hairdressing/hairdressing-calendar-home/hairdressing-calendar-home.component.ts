import { Component, OnInit } from '@angular/core';
import { addDays } from '@household/shared/common/utils';

const timeToSlot = (hour: number, minute: number) => hour * 4 + minute / 15;

export type Entry = {
  start: number;
  end: number;
  title: string;
  type: 'work' | 'personal' | 'issue';
};

export type Day = {
  date: Date;
  dayType: 'workday' | 'weekend' | 'personal' | 'holiday';
  start: number;
  end: number;
  entries: Entry[];
};

const WORKDAY_LENGTH = 7;

const DAY_TYPES: Day['dayType'][] = [
  'workday',
  'personal',
  'workday',
  'holiday',
  'workday',
  'weekend',
  'weekend',
];

const ENTRIES: Entry[][] = [
  [
    {
      start: timeToSlot(8, 30),
      end: timeToSlot(9, 0),
      title: 'Rövid munka hosszabb leírással',
      type: 'work',
    },
    {
      start: timeToSlot(9, 15),
      end: timeToSlot(10, 30),
      title: 'Hosszú munka',
      type: 'work',
    },
    {
      start: timeToSlot(12, 0),
      end: timeToSlot(15, 0),
      title: 'Hosszú hajfestés munka',
      type: 'work',
    },
    {
      start: timeToSlot(13, 30),
      end: timeToSlot(14, 0),
      title: 'Férfi vágás',
      type: 'work',
    },
  ],
  [],
  [
    {
      start: timeToSlot(10, 0),
      end: timeToSlot(11, 0),
      title: 'Masszázs',
      type: 'personal',
    },
    {
      start: timeToSlot(16, 0),
      end: timeToSlot(17, 30),
      title: 'Délutáni munka',
      type: 'work',
    },
  ],
  [],
  [
    {
      start: timeToSlot(8, 0),
      end: timeToSlot(14, 0),
      title: 'Nincs meleg víz',
      type: 'issue',
    },
    // {
    //   start: timeToSlot(8, 0),
    //   end: timeToSlot(9, 0),
    //   title: 'Meleg víz nem kell',
    //   type: 'work',
    // },
  ],
  [],
  [],
];

@Component({
  selector: 'household-hairdressing-calendar-home',
  standalone: false,
  templateUrl: './hairdressing-calendar-home.component.html',
  styleUrl: './hairdressing-calendar-home.component.scss',
})
export class HairdressingCalendarHomeComponent implements OnInit {
  daysOfWeek: Day[];
  isFullDayVisible: boolean;
  isSaturdayVisible: boolean;
  isSundayVisible: boolean;

  private calculateDaysOfWeek (date: Date) {
    this.daysOfWeek = [];
    const day = date.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);

    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const workEntries = ENTRIES[i].filter(e => e.type === 'work');
      this.daysOfWeek.push({
        date: d,
        start: Math.max(timeToSlot(7, 0), workEntries[workEntries.length - 1]?.end - WORKDAY_LENGTH * 4 || Number.NEGATIVE_INFINITY),
        end: Math.min(timeToSlot(21, 0), workEntries[0]?.start + WORKDAY_LENGTH * 4 || Number.POSITIVE_INFINITY),
        dayType: DAY_TYPES[i],
        entries: ENTRIES[i],
      });
    }
  }

  ngOnInit(): void {
    this.calculateDaysOfWeek(new Date());    
  }

  onFullDayVisibilityToggle() {
    this.isFullDayVisible = !this.isFullDayVisible;
    console.log(this.isFullDayVisible);
  }

  onSaturdayVisibilityToggle() {
    this.isSaturdayVisible = !this.isSaturdayVisible;

    if (!this.isSaturdayVisible) {
      this.isSundayVisible = false;
    }
    console.log(this.isSaturdayVisible, this.isSundayVisible);
  }

  onSundayVisibilityToggle() {
    this.isSundayVisible = !this.isSundayVisible;
    console.log(this.isSundayVisible);
  }

  onChangeWeek(diff: number) {
    const date = addDays(diff * 7, this.daysOfWeek[0].date);
    this.calculateDaysOfWeek(date);  
  }

  onShowToday() {
    this.calculateDaysOfWeek(new Date());
  }
}
