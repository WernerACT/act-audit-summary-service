export interface BetweenDates {
  start: string | Date;
  end: string | Date;
}

export interface BeforeDate {
  before: string | Date;
}

export interface AfterDate {
  after: string | Date;
}

export type DateRange = BeforeDate | AfterDate | BetweenDates;

export const isBetweenDates = (value: DateRange): value is BetweenDates => {
  return !!value &&
    !!(value as BetweenDates).start &&
    !!(value as BetweenDates).end;
}

export const isBeforeDate = (value: DateRange): value is BeforeDate => {
  return !!value &&
    !!(value as BeforeDate).before;
}

export const isAfterDate = (value: DateRange): value is AfterDate => {
  return !!value &&
    !!(value as AfterDate).after;
}
