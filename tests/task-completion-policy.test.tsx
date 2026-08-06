import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TasksPage from "@/app/[lang]/tasks/page";
import MethodologyPage from "@/app/[lang]/methodology/page";
import { getDict } from "@/lib/i18n/dictionary";

const LOCALES = ["en", "ko"] as const;

describe("task completion and platform neutrality contract", () => {
  it.each(LOCALES)("publishes a no-partial-credit completion ladder in %s", async (lang) => {
    const dict = getDict(lang) as ReturnType<typeof getDict> & {
      taskPolicy: {
        completionTitle: string;
        noPartialCredit: string;
        completionLevels: readonly { label: string; detail: string }[];
      };
    };
    const { container } = render(await TasksPage({ params: Promise.resolve({ lang }) }));
    const policy = container.querySelector("[data-completion-policy]");

    expect(policy).not.toBeNull();
    const heading = screen.getByRole("heading", { name: dict.taskPolicy.completionTitle });
    expect(heading).toBeInTheDocument();
    expect(heading.closest("section")).toHaveTextContent(dict.taskPolicy.noPartialCredit);
    expect(policy!.getAttribute("role")).toBeNull();
    expect(policy!.querySelector('ol[role="list"]')).not.toBeNull();
    expect(policy!.querySelectorAll("[data-completion-level]")).toHaveLength(5);
  });

  it.each(LOCALES)("publishes auditable market-platform selection rules in %s", async (lang) => {
    const dict = getDict(lang) as ReturnType<typeof getDict> & {
      taskPolicy: {
        platformTitle: string;
        platformRules: readonly { label: string; detail: string }[];
        platformExclusion: string;
        valueTitle: string;
        valueIntro: string;
        valueRules: readonly { label: string; detail: string }[];
      };
    };
    const { container } = render(await MethodologyPage({ params: Promise.resolve({ lang }) }));
    const policy = container.querySelector("[data-platform-policy]");

    expect(policy).not.toBeNull();
    const heading = screen.getByRole("heading", { name: dict.taskPolicy.platformTitle });
    expect(heading).toBeInTheDocument();
    expect(policy!.querySelector('ol[role="list"]')).not.toBeNull();
    expect(policy!.querySelectorAll("[data-platform-rule]")).toHaveLength(5);
    expect(heading.closest("section")).toHaveTextContent(dict.taskPolicy.platformExclusion);
    expect(heading.closest("section")).toHaveTextContent(/representative|대표/i);
    expect(heading.closest("section")).toHaveTextContent(/lineage|계보/i);
  });

  it.each(LOCALES)("publishes market-local acceptance factors in %s", async (lang) => {
    const dict = getDict(lang) as ReturnType<typeof getDict> & {
      taskPolicy: {
        localityTitle: string;
        localityIntro: string;
        localityRules: readonly { label: string; detail: string }[];
      };
    };
    const { container } = render(await MethodologyPage({ params: Promise.resolve({ lang }) }));
    const policy = container.querySelector("[data-locality-policy]");

    expect(policy).not.toBeNull();
    const heading = screen.getByRole("heading", { name: dict.taskPolicy.localityTitle });
    expect(heading.closest("section")).toHaveTextContent(dict.taskPolicy.localityIntro);
    expect(policy!.querySelectorAll("[data-locality-rule]")).toHaveLength(7);
  });

  it.each(LOCALES)("publishes constrained price proximity without a composite score in %s", async (lang) => {
    const dict = getDict(lang) as ReturnType<typeof getDict> & {
      taskPolicy: {
        valueTitle: string;
        valueIntro: string;
        valueRules: readonly { label: string; detail: string }[];
      };
    };
    const { container } = render(await MethodologyPage({ params: Promise.resolve({ lang }) }));
    const policy = container.querySelector("[data-value-policy]");

    expect(policy).not.toBeNull();
    const heading = screen.getByRole("heading", { name: dict.taskPolicy.valueTitle });
    expect(heading.closest("section")).toHaveTextContent(dict.taskPolicy.valueIntro);
    expect(policy!.querySelectorAll("[data-value-rule]")).toHaveLength(6);
    expect(heading.closest("section")).toHaveTextContent(/total|총액/);
    expect(heading.closest("section")).toHaveTextContent(/separate|별도/);
  });
});