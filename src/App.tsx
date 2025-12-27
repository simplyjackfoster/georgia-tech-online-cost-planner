import React, { useEffect, useMemo, useState } from 'react';
import {
  PROGRAMS,
  START_TERMS,
  degreeCreditsByProgram,
  onlineLearningFeeRule,
  perCreditRateByProgram,
  type ProgramKey,
  type StartTermOption,
  type TermSeason
} from './data/rates';
import { calculateFullDegree, formatCurrency } from './lib/calc';

const PACE_OPTIONS = [3, 6, 9];
const TERM_SEQUENCE: TermSeason[] = ['Spring', 'Summer', 'Fall'];

const getFinishTerm = (startTerm: StartTermOption, numberOfTerms: number): StartTermOption => {
  if (numberOfTerms <= 1) {
    return startTerm;
  }
  const startIndex = TERM_SEQUENCE.indexOf(startTerm.season);
  const finishIndex = startIndex + (numberOfTerms - 1);
  const yearOffset = Math.floor(finishIndex / TERM_SEQUENCE.length);
  const season = TERM_SEQUENCE[finishIndex % TERM_SEQUENCE.length];
  const year = startTerm.year + yearOffset;
  return {
    key: `${season.toLowerCase()}-${year}`,
    season,
    year,
    label: `${season} ${year}`
  };
};

const getFeeEfficiency = (creditsPerTerm: number) => {
  if (creditsPerTerm < onlineLearningFeeRule.thresholdCredits) {
    return { icon: '❌', label: 'Low', tone: 'text-tech-goldDark' };
  }
  if (creditsPerTerm < 9) {
    return { icon: '⚠️', label: 'Moderate', tone: 'text-tech-goldMedium' };
  }
  return { icon: '✅', label: 'High', tone: 'text-emerald-600' };
};

const buildShareUrl = (programKey: ProgramKey, startTermKey: string, pace: number): string => {
  const params = new URLSearchParams();
  params.set('program', programKey);
  params.set('start', startTermKey);
  params.set('pace', String(pace));
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
};

const App: React.FC = () => {
  const [programKey, setProgramKey] = useState<ProgramKey>('omscs');
  const [startTermKey, setStartTermKey] = useState<string>(START_TERMS[0]?.key ?? 'spring-2026');
  const [selectedPace, setSelectedPace] = useState<number>(6);
  const [shareStatus, setShareStatus] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const programParam = params.get('program');
    const startParam = params.get('start');
    const paceParam = Number(params.get('pace'));

    if (programParam && programParam in perCreditRateByProgram) {
      setProgramKey(programParam as ProgramKey);
    }
    if (startParam && START_TERMS.some((term) => term.key === startParam)) {
      setStartTermKey(startParam);
    }
    if (PACE_OPTIONS.includes(paceParam)) {
      setSelectedPace(paceParam);
    }
  }, []);

  const startTerm = useMemo(() => {
    return START_TERMS.find((term) => term.key === startTermKey) ?? START_TERMS[0];
  }, [startTermKey]);

  const paceRows = useMemo(() => {
    return PACE_OPTIONS.map((creditsPerTerm) => {
      const fullDegree = calculateFullDegree(
        programKey,
        degreeCreditsByProgram[programKey],
        creditsPerTerm,
        0,
        true,
        3
      );
      const finishTerm = getFinishTerm(startTerm, fullDegree.numberOfTerms);
      const efficiency = getFeeEfficiency(creditsPerTerm);
      return {
        creditsPerTerm,
        finishTerm,
        fullDegree,
        efficiency
      };
    });
  }, [programKey, startTerm]);

  const selectedRow = paceRows.find((row) => row.creditsPerTerm === selectedPace) ?? paceRows[0];
  const selectedEfficiency = selectedRow ? selectedRow.efficiency : getFeeEfficiency(selectedPace);
  const selectedProgram = PROGRAMS.find((program) => program.key === programKey);

  const handleShare = async () => {
    const url = buildShareUrl(programKey, startTermKey, selectedPace);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Link copied to clipboard.');
    } catch (error) {
      console.error('Clipboard unavailable', error);
      setShareStatus('Copy failed. Link opened in a new tab.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-tech-white text-tech-navy">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-tech-goldDark">
              Georgia Tech Online
            </p>
            <h1 className="text-2xl font-semibold text-tech-goldMedium">
              OMS Degree Planning Calculator
            </h1>
            <p className="text-xs text-tech-navy/70">
              Compare pacing options and map the fastest, most cost-efficient OMS degree plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg bg-tech-navy px-4 py-2 font-semibold text-tech-white transition hover:opacity-90"
            >
              Share My Degree Plan
            </button>
          </div>
        </header>

        {shareStatus ? <p className="mt-2 text-xs text-tech-goldDark">{shareStatus}</p> : null}

        <main className="mt-3 grid flex-1 gap-4 lg:grid-cols-[minmax(360px,1fr)_minmax(360px,1fr)_minmax(360px,1fr)]">
          <section className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                Step 1 — Choose Program
              </p>
              <div className="mt-3 grid gap-2">
                {PROGRAMS.map((program) => (
                  <button
                    key={program.key}
                    type="button"
                    onClick={() => setProgramKey(program.key)}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      programKey === program.key
                        ? 'border-tech-gold bg-tech-gold/20'
                        : 'border-tech-gold/30 bg-tech-white hover:border-tech-gold/60'
                    }`}
                  >
                    <p className="text-lg font-semibold text-tech-navy">
                      {program.key.toUpperCase()}
                    </p>
                    <p className="text-xs text-tech-navy/70">{program.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                Step 2 — Compare Paces
              </p>
              <label className="mt-2 block text-xs font-semibold text-tech-navy">
                Start semester
                <select
                  className="mt-2 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30"
                  value={startTermKey}
                  onChange={(event) => setStartTermKey(event.target.value)}
                >
                  {START_TERMS.map((term) => (
                    <option key={term.key} value={term.key}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-3 overflow-hidden rounded-xl border border-tech-gold/30">
                <table className="w-full text-left text-xs">
                  <thead className="bg-tech-gold/10 text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                    <tr>
                      <th className="px-3 py-2">Credits / Term</th>
                      <th className="px-3 py-2">Finish Semester</th>
                      <th className="px-3 py-2">Total Cost</th>
                      <th className="px-3 py-2">Avg / Term</th>
                      <th className="px-3 py-2">Fee Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paceRows.map((row) => (
                      <tr
                        key={row.creditsPerTerm}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPace(row.creditsPerTerm)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedPace(row.creditsPerTerm);
                          }
                        }}
                        className={`cursor-pointer border-t border-tech-gold/20 transition ${
                          selectedPace === row.creditsPerTerm
                            ? 'bg-tech-navy text-tech-white'
                            : 'hover:bg-tech-gold/10'
                        }`}
                        aria-pressed={selectedPace === row.creditsPerTerm}
                        aria-label={`Select ${row.creditsPerTerm} credits per term`}
                      >
                        <td className="px-3 py-2 font-semibold">{row.creditsPerTerm}</td>
                        <td className="px-3 py-2">{row.finishTerm.label}</td>
                        <td className="px-3 py-2">{formatCurrency(row.fullDegree.totalCost)}</td>
                        <td className="px-3 py-2">{formatCurrency(row.fullDegree.averagePerTerm)}</td>
                        <td className="px-3 py-2 font-semibold">
                          <span className={row.efficiency.tone}>
                            {row.efficiency.icon} {row.efficiency.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
            <div className="rounded-2xl bg-tech-navy px-4 py-4 text-tech-white">
              <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">
                Step 3 — Your Degree Plan Dashboard
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Your {selectedProgram?.key.toUpperCase()} Plan
              </h2>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Start</span>
                  <span className="font-semibold">{startTerm.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Finish</span>
                  <span className="font-semibold">{selectedRow.finishTerm.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Degree Cost</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedRow.fullDegree.totalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Per Term</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedRow.fullDegree.averagePerTerm)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Terms Needed</span>
                  <span className="font-semibold">{selectedRow.fullDegree.numberOfTerms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fee Efficiency</span>
                  <span className={`font-semibold ${selectedEfficiency.tone}`}>
                    {selectedEfficiency.icon} {selectedEfficiency.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                  Tuition total
                </p>
                <p className="mt-2 text-lg font-semibold text-tech-navy">
                  {formatCurrency(selectedRow.fullDegree.totalTuition)}
                </p>
              </div>
              <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                  Fee total
                </p>
                <p className="mt-2 text-lg font-semibold text-tech-navy">
                  {formatCurrency(selectedRow.fullDegree.totalFees)}
                </p>
              </div>
              <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                  Per-term cost
                </p>
                <p className="mt-2 text-lg font-semibold text-tech-navy">
                  {formatCurrency(selectedRow.fullDegree.averagePerTerm)}
                </p>
              </div>
              <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                  Time to graduate
                </p>
                <p className="mt-2 text-lg font-semibold text-tech-navy">
                  {selectedRow.fullDegree.numberOfTerms} semesters
                </p>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-3">
            <section className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm">
              <h2 className="text-sm font-semibold text-tech-goldMedium">
                Step 4 — Official Rates Panel
              </h2>
              <p className="mt-2 text-[11px] text-tech-navy/60">Official Spring 2026 rates.</p>
              <div className="mt-3 space-y-2">
                {PROGRAMS.map((program) => (
                  <div key={program.key} className="flex items-center justify-between">
                    <span>{program.label}</span>
                    <span className="font-semibold">
                      {formatCurrency(program.perCreditRate)}/credit
                    </span>
                  </div>
                ))}
                <div className="border-t border-tech-gold/30 pt-2">
                  <p>
                    Fee rule: credits &lt; {onlineLearningFeeRule.thresholdCredits} ⇒{' '}
                    {formatCurrency(onlineLearningFeeRule.belowThresholdFee)}, credits ≥{' '}
                    {onlineLearningFeeRule.thresholdCredits} ⇒{' '}
                    {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}
                  </p>
                </div>
                <div className="border-t border-tech-gold/30 pt-2">
                  <p className="font-semibold">Degree credit requirements</p>
                  {PROGRAMS.map((program) => (
                    <p key={program.key}>
                      {program.label}: {degreeCreditsByProgram[program.key]} credits
                    </p>
                  ))}
                </div>
                <div className="rounded-lg border border-tech-gold/30 bg-tech-gold/10 px-3 py-2 text-[11px] text-tech-navy/70">
                  Data transparency: Tuition and fee math comes directly from the Spring 2026
                  configuration in this dashboard. No external links or hidden markups.
                </div>
              </div>
            </section>

            <details className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-tech-goldMedium">
                Explain the math
              </summary>
              <ul className="mt-3 space-y-2">
                <li>
                  <strong className="text-tech-goldDark">Total tuition:</strong> required credits ×
                  per-credit rate.
                </li>
                <li>
                  <strong className="text-tech-goldDark">Terms needed:</strong> ceil(required credits
                  ÷ credits per term).
                </li>
                <li>
                  <strong className="text-tech-goldDark">Fee per term:</strong> credits per term &lt;{' '}
                  {onlineLearningFeeRule.thresholdCredits}
                  ? {formatCurrency(onlineLearningFeeRule.belowThresholdFee)} :{' '}
                  {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}.
                </li>
                <li>
                  <strong className="text-tech-goldDark">Total fees:</strong> fee per term × terms
                  needed.
                </li>
                <li>
                  <strong className="text-tech-goldDark">Finish semester:</strong> advance term-by-term
                  using Spring → Summer → Fall (3 terms per year).
                </li>
              </ul>
            </details>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default App;
