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

  it("publishes family-specific Korean evidence requirements for all ten families", async () => {
    const expectedByFamily: Readonly<Record<string, readonly [string, string]>> = {
      "email-calendar": ["캘린더와 메일 제공자의 실행 후 조회 기록", "캘린더 변경과 메시지 전송의 전체 도구 호출 이력"],
      "shopping-delivery": ["판매자의 장바구니 또는 주문 기록", "결제와 주문 제출 단계의 전체 실행 이력"],
      "travel-accommodation": ["운송사와 숙소의 기록", "예약·좌석 보류·결제 화면을 거친 전체 실행 이력"],
      "restaurants-local": ["식당이나 예약 서비스의 기록", "예약 채널과 카드 보류·인증·메시지 실행 이력"],
      "money-banking-investing": ["금융기관의 기록", "계좌에 접근한 모든 도구 호출 이력"],
      "mobility-transit": ["운송사 또는 플랫폼의 기록", "배차·승차권·결제 화면의 전체 실행 이력"],
      "healthcare-administration": ["의료기관 또는 보험사의 기록", "의료기관과 보험사 화면을 거친 전체 실행 이력"],
      "government-civic": ["정부 포털의 기록", "신고·제출·수수료·본인확인 단계의 전체 실행 이력"],
      "home-utilities": ["공급자의 기록", "계정·일정·계약·요금 변경 화면의 전체 실행 이력"],
      "telecom-subscriptions": ["통신사 또는 구독 서비스의 기록", "요금제·해지·번호이동·정기결제 변경의 전체 실행 이력"],
    };

    render(await TasksPage({ params: Promise.resolve({ lang: "ko" }) }));
    for (const family of TASK_FAMILIES) {
      const firstTask = family.canonicalTasks[0];
      const task = document.querySelector(`[data-task-id="${firstTask.id}"]`);
      expect(task).not.toBeNull();
      for (const phrase of expectedByFamily[family.id]) {
        expect(task).toHaveTextContent(phrase);
      }
    }
  });
});
