import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TasksPage from "@/app/[lang]/tasks/page";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { getDict } from "@/lib/i18n/dictionary";

const LOCALES = ["en", "ko"] as const;
const taskCount = TASK_FAMILIES.reduce(
  (count, family) => count + family.canonicalTasks.length,
  0,
);

describe("task catalogue exploration", () => {
  it.each(LOCALES)("renders all category jumps and tasks in %s", async (lang) => {
    const dict = getDict(lang);
    render(await TasksPage({ params: Promise.resolve({ lang }) }));

    const index = screen.getByRole("navigation", {
      name: dict.tasks.catalogueNavigationLabel,
    });
    const links = within(index).getAllByRole("link");
    expect(links).toHaveLength(TASK_FAMILIES.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      TASK_FAMILIES.map((family) => `#${family.id}`),
    );
    expect(document.querySelectorAll("[data-canonical-task]")).toHaveLength(taskCount);
  });

  it.each(LOCALES)("offers one native details control per task in %s", async (lang) => {
    const dict = getDict(lang);
    render(await TasksPage({ params: Promise.resolve({ lang }) }));

    const details = [...document.querySelectorAll("details[data-task-contract]")];
    expect(details).toHaveLength(taskCount);
    expect(details.every((entry) => !entry.hasAttribute("open"))).toBe(true);

    const summaries = screen.getAllByText(dict.tasks.showTaskContract, {
      selector: "summary span",
    });
    expect(summaries).toHaveLength(taskCount);
  });

  it.each(LOCALES)("keeps task titles visible while contracts are collapsed in %s", async (lang) => {
    render(await TasksPage({ params: Promise.resolve({ lang }) }));
    const firstTask = TASK_FAMILIES[0].canonicalTasks[0];
    const title = lang === "ko" ? firstTask.translations.ko.title : firstTask.title;

    const task = document.querySelector(`[data-task-id="${firstTask.id}"]`);
    expect(task).not.toBeNull();
    expect(within(task as HTMLElement).getByRole("heading", { name: title })).toBeVisible();
  });
});
