"use client";

export type ScenarioKey = "SCENARIO_A_COMPLIANT_WIN" | "SCENARIO_B_ADVERSARIAL_BLOCK" | "SCENARIO_C_BATNA_WALKAWAY";

export interface ScenarioDefinition {
  key: ScenarioKey;
  label: string;
  badge: string;
  badgeType: "success" | "danger" | "warning";
  description: string;
  economics: string;
}

export const JUDGE_SCENARIOS: ScenarioDefinition[] = [
  {
    key: "SCENARIO_A_COMPLIANT_WIN",
    label: "Scenario A: Compliant Deal",
    badge: "10.02% Savings · SAT",
    badgeType: "success",
    description: "Z3 guides cable to $25.62, verifies all 6 invariants SAT, mints Ed25519 certificate, and settles via PayPal.",
    economics: "Landed: $4,271.33 · BATNA: $4,746.90 · Net Savings: $475.57",
  },
  {
    key: "SCENARIO_B_ADVERSARIAL_BLOCK",
    label: "Scenario B: Injection + $850 Freight",
    badge: "3 Invariants UNSAT",
    badgeType: "danger",
    description: "Adversary injects policy override and hides $850 freight ($5,011.33 landed). Z3 blocks INV_1, INV_2, & INV_3.",
    economics: "Landed: $5,011.33 · Exceeds Budget ($4.6k) and BATNA ($4.75k)",
  },
  {
    key: "SCENARIO_C_BATNA_WALKAWAY",
    label: "Scenario C: Standing Order Watch",
    badge: "Channel3 Webhook",
    badgeType: "warning",
    description: "Merchant refuses volume concession ($4,857.85 landed > BATNA). Enters Channel3 /v0 webhook standing order.",
    economics: "Landed: $4,857.85 · Awaiting price drop trigger",
  },
];

interface Props {
  onRun: (scenario: ScenarioKey) => void;
  busy: boolean;
  activeScenario?: ScenarioKey;
}

export function JudgeScenarioBar({ onRun, busy, activeScenario }: Props) {
  return (
    <section className="scenario-bar" aria-label="Demo scenarios">
      <div className="scenario-header">
        <span className="scenario-tag">1-Click Judge Scenarios</span>
        <span className="benchmark-tag">Benchmark: 10x 4K Monitors + 10x TB4 Cables · Budget Cap: $4,600.00</span>
      </div>
      <div className="scenario-grid">
        {JUDGE_SCENARIOS.map((sc) => {
          const isSelected = activeScenario === sc.key;
          return (
            <button
              key={sc.key}
              className={`scenario-card ${sc.badgeType} ${isSelected ? "selected" : ""}`}
              onClick={() => onRun(sc.key)}
              disabled={busy}
            >
              <div className="scenario-card-top">
                <strong>{sc.label}</strong>
                <span className={`pill ${sc.badgeType}`}>{sc.badge}</span>
              </div>
              <p className="scenario-desc">{sc.description}</p>
              <div className="scenario-econ">{sc.economics}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
