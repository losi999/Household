import { calendarEntryDocumentConverterFactory } from '@household/shared/converters/calendar-entry-document-converter';
import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';

export const calendarEntryDocumentConverter = calendarEntryDocumentConverterFactory(customerDocumentConverter, priceDocumentConverter);
