"use client";

import { useState } from "react";
import { COUNTRIES } from "@/data/demo/countries";
import { PUBLIC_TASK_FAMILIES } from "@/data/demo/tasks";

import {
  parseEvaluationScope,
  summarizeEvaluationScope,
  type EvaluationMode,
} from "@/lib/evaluation-scope";
import type { Dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function EvaluationPlanner({ dict, lang }: { dict: Dict; lang: Locale }) {
  const firstCountry = COUNTRIES[0]?.code ?? "";
  const firstTask = PUBLIC_TASK_FAMILIES[0]?.canonicalTasks[0]?.id ?? "";
  const [mode, setMode] = useState<EvaluationMode>("country-focused");
  const [countries, setCountries] = useState<string[]>(firstCountry ? [firstCountry] : []);
  const [tasks, setTasks] = useState<string[]>(firstTask ? [firstTask] : []);
  const scope = parseEvaluationScope({ mode, countries, tasks });
  const summary = summarizeEvaluationScope(scope);

  function toggle(value: string, selected: string[], update: (next: string[]) => void) {
    update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  const modes: { id: EvaluationMode; label: string }[] = [
    { id: "country-focused", label: dict.evaluate.countryFocused },
    { id: "task-focused", label: dict.evaluate.taskFocused },
    { id: "custom", label: dict.evaluate.custom },
    { id: "full-benchmark", label: dict.evaluate.fullBenchmark },
  ];
  const countryNames = scope.countries.map((id) => dict.markets[id as keyof typeof dict.markets] ?? id);
  const taskTitles = PUBLIC_TASK_FAMILIES.flatMap((family) => family.canonicalTasks)
    .filter((task) => scope.tasks.includes(task.id))
    .map((task) => lang === "ko" ? task.translations.ko.title : task.title);

  return (
    <div className="mica-evaluate-layout">
      <form className="mica-evaluate-controls" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="mica-evaluate-modes" role="radiogroup">
          <legend>{dict.evaluate.modeLegend}</legend>
          {modes.map((entry) => (
            <label key={entry.id}>
              <input type="radio" name="mode" value={entry.id} checked={mode === entry.id} onChange={() => setMode(entry.id)} />
              <span>{entry.label}</span>
            </label>
          ))}
        </fieldset>

        <fieldset disabled={mode === "task-focused" || mode === "full-benchmark"}>
          <legend>{dict.evaluate.countriesLegend}</legend>
          <p className="mica-micro">{dict.evaluate.selectCountryHint}</p>
          <div className="mica-evaluate-checks">
            {COUNTRIES.map((country) => (
              <label key={country.code}>
                <input type="checkbox" checked={countries.includes(country.code)} onChange={() => toggle(country.code, countries, setCountries)} />
                <span>{dict.markets[country.code]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={mode === "country-focused" || mode === "full-benchmark"}>
          <legend>{dict.evaluate.tasksLegend}</legend>
          <p className="mica-micro">{dict.evaluate.selectTaskHint}</p>
          <div className="mica-evaluate-task-list">
            {PUBLIC_TASK_FAMILIES.map((family) => (
              <section key={family.id} aria-labelledby={`family-${family.id}`}>
                <h3 id={`family-${family.id}`}>{dict.families[family.id].label}</h3>
                {family.canonicalTasks.map((task) => (
                  <label key={task.id}>
                    <input type="checkbox" checked={tasks.includes(task.id)} onChange={() => toggle(task.id, tasks, setTasks)} />
                    <span>{lang === "ko" ? task.translations.ko.title : task.title}</span>
                  </label>
                ))}
              </section>
            ))}
          </div>
        </fieldset>
      </form>

      <aside className="mica-evaluate-summary" aria-live="polite" aria-atomic="true">
        <span className="mica-eyebrow">{dict.evaluate.summaryTitle}</span>
        {!scope.valid && <p role="alert">{dict.evaluate.invalid}</p>}
        <dl>
          <div><dt>{dict.evaluate.selectedCountries}</dt><dd>{countryNames.length} / {COUNTRIES.length}</dd></div>
          <div><dt>{dict.evaluate.selectedTasks}</dt><dd>{taskTitles.length} / {PUBLIC_TASK_FAMILIES.flatMap((f) => f.canonicalTasks).length}</dd></div>
          <div><dt>{dict.evaluate.planned}</dt><dd>{summary.planned}</dd></div>
          <div><dt>{dict.evaluate.executionEligible}</dt><dd>{summary.executionEligible} / {summary.planned}</dd></div>
          <div><dt>{dict.evaluate.executed}</dt><dd>{summary.executed} / {summary.planned}</dd></div>
          <div><dt>{dict.evaluate.failed}</dt><dd>{summary.failed} / {summary.planned}</dd></div>
          <div><dt>{dict.evaluate.harnessFailed}</dt><dd>{summary.harnessFailed} / {summary.planned}</dd></div>
          <div><dt>{dict.evaluate.notApplicable}</dt><dd>{summary.notApplicable} / {summary.planned}</dd></div>
        </dl>
        <details>
          <summary>{dict.evaluate.selectedCountries}</summary>
          <p>{countryNames.join(", ") || "0"}</p>
        </details>
        <details>
          <summary>{dict.evaluate.selectedTasks}</summary>
          <ol>{taskTitles.map((title) => <li key={title}>{title}</li>)}</ol>
        </details>
      </aside>
    </div>
  );
}
