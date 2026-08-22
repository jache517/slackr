import { CheckIcon } from "@/components/icons";

import { STEPS, type StepIndex } from "./steps";

/**
 * The numbered four-step progress indicator.
 *
 * It reports position, it is not a control: a step you have not reached is
 * not reachable by clicking a circle, because the draft has to pass each
 * step's checks on the way through. The list carries its own text summary
 * ("Step 2 of 4") so the state does not rest on colour alone.
 */
export function Stepper({ current }: { current: StepIndex }) {
  return (
    <nav aria-label="Progress" className="flex flex-col gap-3">
      <p className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
        Step {current + 1} of {STEPS.length}: {STEPS[current].label}
      </p>

      <ol className="flex list-none items-center p-0">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-3 last:flex-none"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  data-tabular
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-body font-semibold ${
                    active
                      ? "bg-indigo-600 text-white"
                      : done
                        ? "border-[1.5px] border-indigo-600 text-indigo-600"
                        : "border-[1.5px] border-ink-300 text-ink-500"
                  }`}
                >
                  {done ? <CheckIcon size={14} /> : index + 1}
                </span>
                <span
                  aria-current={active ? "step" : undefined}
                  className={`text-body whitespace-nowrap ${
                    active
                      ? "font-semibold text-indigo-600"
                      : done
                        ? "text-ink-900"
                        : "text-ink-500"
                  }`}
                >
                  {step.label}
                  <span className="sr-only">
                    {done ? " (done)" : active ? " (current step)" : " (not started)"}
                  </span>
                </span>
              </span>

              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={`h-px min-w-6 flex-1 ${
                    done ? "bg-indigo-600" : "bg-ink-300"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
