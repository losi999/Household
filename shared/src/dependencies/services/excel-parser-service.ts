import { excelParserServiceFactory } from '@household/shared/services/excel-parser-service';
import { read, utils } from 'xlsx';
import { default as moment } from 'moment-timezone';

export const excelParserService = excelParserServiceFactory(read, utils, moment);
