export type ProgramKey = 'omsa' | 'omscs' | 'omscsec';
export type TermSeason = 'Spring' | 'Summer' | 'Fall';

export type StartTermOption = {
  key: string;
  season: TermSeason;
  year: number;
  label: string;
};

export const PROGRAM_LABELS: Record<ProgramKey, string> = {
  omsa: 'MS in Analytics (OMSA)',
  omscs: 'MS in Computer Science (OMSCS)',
  omscsec: 'MS in Cybersecurity (OMSCSEC)'
};

export const perCreditRateByProgram: Record<ProgramKey, number> = {
  omsa: 327,
  omscs: 225,
  omscsec: 369
};

export const degreeCreditsByProgram: Record<ProgramKey, number> = {
  omsa: 36,
  omscs: 30,
  omscsec: 30
};

export const onlineLearningFeeRule = {
  thresholdCredits: 4,
  belowThresholdFee: 176,
  atOrAboveThresholdFee: 440
};

export const MAX_CREDITS_PER_TERM = 21;
export const MAX_TERMS = 30;
export const TERMS_PER_YEAR_OPTIONS = [2, 3] as const;

export const PROGRAMS = (['omscs', 'omsa', 'omscsec'] as ProgramKey[]).map((key) => ({
  key,
  label: PROGRAM_LABELS[key],
  perCreditRate: perCreditRateByProgram[key],
  degreeCredits: degreeCreditsByProgram[key]
}));

export const START_TERMS: StartTermOption[] = [
  { key: 'spring-2026', season: 'Spring', year: 2026, label: 'Spring 2026' },
  { key: 'summer-2026', season: 'Summer', year: 2026, label: 'Summer 2026' },
  { key: 'fall-2026', season: 'Fall', year: 2026, label: 'Fall 2026' }
];
