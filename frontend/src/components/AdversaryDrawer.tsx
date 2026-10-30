"use client";

export type AdversaryConfig = { merchant_floor_ratio: number; attack_mode: string };
type Props = { value: AdversaryConfig; onChange: (value: AdversaryConfig) => void; onRun: () => void; busy: boolean };
export function AdversaryDrawer({ value, onChange, onRun, busy }: Props) {
  return <aside className="adversary-card"><div><p className="eyebrow">Simulation controls</p><h2>Merchant behavior</h2></div>
    <label>Merchant floor: {(value.merchant_floor_ratio * 100).toFixed(0)}% of BATNA<input suppressHydrationWarning type="range" min="0.75" max="1.15" step="0.01" value={value.merchant_floor_ratio} onChange={(event) => onChange({ ...value, merchant_floor_ratio: Number(event.target.value) })} /></label>
    <label>Attack mode<select suppressHydrationWarning value={value.attack_mode} onChange={(event) => onChange({ ...value, attack_mode: event.target.value })}><option value="NONE">None</option><option value="HIDDEN_FREIGHT">Hidden freight</option><option value="CROSS_SUBSIDY">Cross subsidy</option><option value="PROMPT_INJECTION">Prompt injection</option><option value="QTY_BAIT_SWITCH">Quantity bait and switch</option></select></label>
    <button suppressHydrationWarning className="button secondary" onClick={onRun} disabled={busy}>Run custom simulation</button>
  </aside>;
}
