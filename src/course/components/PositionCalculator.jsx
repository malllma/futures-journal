// PositionCalculator: interactive widget showing how stop distance and risk %
// translate to contracts on ES (and MES). Reinforces the module 10/11 math.

import React, { useState } from 'react';

const POINT_VALUE_ES = 50;
const POINT_VALUE_MES = 5;

export function PositionCalculator() {
  const [accountSize, setAccountSize] = useState(50000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPoints, setStopPoints] = useState(5);

  const dollarRisk = accountSize * (riskPct / 100);
  const riskPerContractES = stopPoints * POINT_VALUE_ES;
  const riskPerContractMES = stopPoints * POINT_VALUE_MES;

  const contractsES = riskPerContractES > 0 ? Math.floor(dollarRisk / riskPerContractES) : 0;
  const contractsMES = riskPerContractMES > 0 ? Math.floor(dollarRisk / riskPerContractMES) : 0;

  const actualRiskES = contractsES * riskPerContractES;
  const actualRiskMES = contractsMES * riskPerContractMES;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-5">
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Position size calculator
        </h4>
        <p className="text-xs text-zinc-500 mt-1">
          Adjust the inputs to see how your structural stop and risk % determine contract count.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="Account size ($)"
          value={accountSize}
          onChange={setAccountSize}
          step={1000}
          min={1000}
          max={1000000}
        />
        <Field
          label="Risk per trade (%)"
          value={riskPct}
          onChange={setRiskPct}
          step={0.25}
          min={0.25}
          max={5}
          decimals={2}
        />
        <Field
          label="Stop distance (points)"
          value={stopPoints}
          onChange={setStopPoints}
          step={0.5}
          min={0.5}
          max={50}
          decimals={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultBlock
          label="ES (point value $50)"
          dollarRisk={dollarRisk}
          contracts={contractsES}
          actualRisk={actualRiskES}
          riskPerContract={riskPerContractES}
        />
        <ResultBlock
          label="MES (point value $5)"
          dollarRisk={dollarRisk}
          contracts={contractsMES}
          actualRisk={actualRiskMES}
          riskPerContract={riskPerContractMES}
        />
      </div>

      <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
        <strong className="text-zinc-400">Note:</strong> contracts rounded down. If 0 contracts at ES, the trade is too big for your account at the chosen risk — either widen risk %, tighten the stop, or use MES.
      </div>
    </div>
  );
}

function Field({ label, value, onChange, step, min, max, decimals = 0 }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm
                   text-zinc-100 font-mono focus:outline-none focus:border-zinc-600"
      />
    </div>
  );
}

function ResultBlock({ label, dollarRisk, contracts, actualRisk, riskPerContract }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
      <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium">{label}</div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-zinc-400">Risk budget:</span>
        <span className="font-mono text-sm text-zinc-200">${dollarRisk.toFixed(0)}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-zinc-400">Risk per contract:</span>
        <span className="font-mono text-sm text-zinc-200">${riskPerContract.toFixed(2)}</span>
      </div>
      <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800">
        <span className="text-xs text-zinc-300 font-medium">Contracts:</span>
        <span className={`font-mono text-xl font-bold ${contracts > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {contracts}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-zinc-400">Actual risk:</span>
        <span className="font-mono text-sm text-zinc-200">${actualRisk.toFixed(2)}</span>
      </div>
    </div>
  );
}
