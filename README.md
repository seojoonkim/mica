# MICA

**Multinational Index of Consumer Agents**

MICA is a public benchmark for complete consumer-agent systems performing everyday tasks across countries. It evaluates the system snapshot as a whole, including model routing, memory, tools, localization, safety, and recovery.

> This repository currently contains illustrative demo data only. It is not an official ranking and does not describe the real performance of any product.

## MVP scope

- Markets: South Korea, Japan, Singapore, Taiwan, Thailand
- Task families: Email & Calendar, Shopping & Delivery, Travel & Accommodation, Restaurants & Local Services
- Outcome axes: Accuracy, Speed, Cost, always reported separately
- Verification states: Independent rerun, provisional, self-reported
- Publication rule: demo records and any result with a critical safety event are never publication eligible

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test --run
pnpm typecheck
pnpm build
```

The application builds without secrets and uses version-controlled fixtures by default.

## Data architecture

Canonical demo records live under `src/data/demo/` and are validated by Zod at module load. Pages derive their views through `src/lib/derive.ts`; displayed aggregates are not stored as duplicate facts. Statistical contracts and publication gates live in `src/lib/calc.ts` and `src/data/policy/`.

Static demo exports are available at:

- `/data/demo/mica-demo.json`
- `/data/demo/mica-demo.csv`

Every demo record is marked `dataStatus: "demo"` and `publicationEligible: false`. The schema guard rejects a demo record that claims publication eligibility.

## Optional Supabase boundary

`src/lib/data/source.ts` defines the data-source boundary for a future remote store. Supabase is intentionally not installed or required for the first preview. Copy `.env.example` only when a remote source is introduced:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Leaving both values empty preserves the local fixture source and a secret-free build.

## Publication principles

- Missing coverage is null, never zero.
- Accuracy includes the raw numerator and denominator with a Wilson 95% interval.
- Speed is end-to-end wall-clock latency for successful eligible runs.
- Cost per success charges all eligible attempt cost to successful runs.
- A zero-success cell renders `No successful task`, not zero or infinity.
- Global comparisons require complete country coverage and use country macro-averages.
- MICA publishes no official composite score.

## Deployment

The application targets Vercel and uses `https://micabench.com` as its canonical metadata base. The initial preview can be deployed before the custom domain is attached.
