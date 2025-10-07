import { customerDocumentConverterFactory } from '@household/shared/converters/customer-document-converter';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';

export const customerDocumentConverter = customerDocumentConverterFactory(priceDocumentConverter, calendarEntryDocumentConverter);
