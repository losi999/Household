import { calendarDayDocumentConverterFactory } from '@household/shared/converters/calendar-day-document-converter';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';

export const calendarDayDocumentConverter = calendarDayDocumentConverterFactory(calendarEntryDocumentConverter);
