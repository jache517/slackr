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

      <ol className="flex list-none items-start p-0">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li
              key={step.id}
              className="relative flex flex-1 flex-col items-center gap-2"
            >
              {/*
                The rule runs circle to circle, behind nothing and touching
                neither. Every item is the same width, so half an item plus
                the circle's radius and a gap lands it exactly on the edge of
                this circle and of the next one.
              */}
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute top-4 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px ${
                    done ? "bg-indigo-600" : "bg-ink-300"
                  }`}
                />
              ) : null}

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
                className={`text-body text-center whitespace-nowrap ${
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
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
