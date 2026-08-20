# Stop Automating Peer Review Without Rigorous Evaluation

**Authors:** Joachim Baumann, Jiaxin Pei, Sanmi Koyejo, Dirk Hovy
**Date:** Submitted 4 May 2026, revised 5 Jul 2026 (arXiv preprint; accepted as an Oral at ICML 2026, Position Paper Track)
**Source:** [arXiv:2605.03202](https://arxiv.org/abs/2605.03202)
**Relevance to Slackr:** Not about student group work directly, this is about AI-automated peer review of academic papers, but it is the strongest available evidence base for a question Slackr's own design already answers by staying advisory: can an AI system be trusted to render a verdict on human work, or does automation systematically fail at exactly the judgment tasks that matter most? The paper's empirical case against full automation (homogenized judgment, trivial gameability) is a direct, data-backed argument for Slackr's "evidence, not verdict" stance.

## Summary

This is a position paper, backed by original empirical experiments, arguing that today's AI systems should not be used to produce paper reviews or acceptance judgments, even though LLM-generated reviews are already widespread at major AI conferences (an estimated 21% of ICLR 2026 reviews were AI-generated). The authors identify two "necessary conditions" any peer-review automation must satisfy: (C1) preservation of review diversity - the system must not collapse the plurality of expert perspectives peer review depends on, and (C2) resistance to gaming - the system must not be trivially manipulable into higher scores without genuine improvement of the underlying work. Using 75,800 real ICLR 2026 reviews plus a controlled 60-paper simulation with GPT-5.1, GPT-5.4, and Claude Sonnet 4.5 as AI reviewer agents, they show current systems fail both conditions, and argue the field needs a rigorous "science of peer review automation" rather than deploying general-purpose LLMs as judges.

## Key Findings

**The "hivemind effect" (fails C1, diversity):**
- Across all 75,800 ICLR 2026 reviews, fully AI-generated reviews were significantly more similar to one another (mean similarity 0.486) than reviews with any human involvement (mean 0.467; p<0.0001, Cohen's d=0.29) - and this held in all 21 ICLR primary subject areas.
- In the controlled 60-paper simulation, AI reviews of the same paper agreed with each other far more than human reviewers did (IntraSim: AI 0.882 vs. human 0.811, an 8.7% increase, Cohen's d=1.47).
- AI reviewers were also far more likely to reuse the same generic language across completely different papers (InterSim): GPT-5.1 showed 37.4% higher cross-paper similarity than humans (d=3.55); the most common GPT stock phrase ("if not, can you comment on") appeared in 13.3% of all AI reviews, and the most common Claude phrase ("how does the method handle") in 21.7%, versus under 1% for any human phrase.
- AI review scores correlated weakly with human scores (r=0.15) but strongly with each other (r=0.49), and were systematically inflated (mean 7.3/10 for GPT, 6.1/10 for Claude, vs. 4.3/10 for humans).
- Averaged human scores predicted the actual accept/reject decision far better than averaged AI scores (AUC 0.822 vs. 0.710 across 8,015 papers with both).

**"Paper laundering" (fails C2, gameability):**
- Feeding a paper through a single zero-shot LLM rewrite ("launder" it) before AI review raised AI review scores by +0.45 points on a 1-10 scale on average, significant in nearly all of 24 tested prompt/model combinations (p<0.001). Cost: about $0.25 per paper.
- The gains were almost entirely stylistic (more hedging words like "may," "typically," "suggests"; more emphasis words like "strong," "robust," "consistent"), not substantive - manual inspection found much of the added content was ungrounded "AI slop."
- Laundered papers converged toward each other stylistically: pairwise similarity between laundered papers rose 6.5% over originals (Cohen's d=1.02), evidence of an emerging "intellectual monoculture" where writing style optimized for the AI reviewer, not the science, becomes rewarded.
- Unlike prompt-injection attacks, laundering requires no hidden instructions and violates no conference policy currently in place - "a single zero-shot rewrite suffices to boost scores, making it trivially accessible to any author."

## Notable Quotes

> "We identify two critical issues: 1) AI reviewers exhibit a hivemind effect of excessive agreement within and across papers that reduces perspective diversity. 2) AI review scores are trivially gameable through paper laundering... demonstrating that LLM reviewers are easy to game through stylistic changes rather than scientific results."

> "The value of multiple reviewers lies in noticing different things. Unlike review ratings, if two textual reviews are nearly identical, the second adds little information."

> "Human biases and inconsistencies are spread across multiple reviewers with different areas of expertise. Through aggregation, these errors partially cancel out. AI errors are correlated, as models trained on similar data are likely to share biases... When many decision-makers rely on the same model, aggregate decision quality can decrease even if each individual decision looks reasonable."

> "Gaming one human reviewer does not transfer to others, so there is no universal attack. AI gameability, on the other hand, is centralized. A single rewrite strategy can boost scores across models."

> "AI conference guidelines require authors to take full responsibility for all paper contents, including any content generated by AI. As such, paper laundering puts them at risk of inadvertent plagiarism and scientific misconduct."

> "Our position is more specific: AI should not automate judgment relevant to acceptance decisions without prior scientific evaluation. Moreover, AI assistance to human reviewers is one thing. AI replacement of human judgment is another."

> "The solution to the peer review crisis is not to hand over judgment to general-purpose LLMs without thorough evaluation. The solution is a rigorous science of peer review automation."

> "A recent survey found that 56% of ICLR 2025 reviewers do not support official AI-generated reviews."

## Proposed Path Forward (Section 6)

The authors set out three concrete pre-deployment requirements for any AI system touching peer review:
1. **Adversarial robustness testing** - red-team evaluation against manipulation (including laundering-style attacks) before deployment; "a system that can be trivially gamed should not influence acceptance decisions."
2. **Validated accuracy with acceptable false-positive rates.**
3. **Transparency about AI deployment** - disclosed, not silent, automation (they note ICLR 2026 uses LLMs for pre-review screening but conferences "rarely disclose such automation publicly," which "undermines community trust").

They explicitly distinguish tasks with easily verifiable outputs (formatting checks, hallucinated-reference detection - good fits for AI assistance because humans can quickly validate results) from tasks requiring authentic, hard-to-verify human judgment (substantive quality assessment, acceptance decisions - poor fits for automation).

## Anticipated Objections, Addressed

The paper pre-empts four counterarguments: that human review is flawed too so AI can't be worse (rebutted via the distributed-vs-centralized error framing above); that laundering just reflects genuine quality improvement (rebutted - it's unsupervised, purely stylistic, and creates systemic homogenization even when individual edits look benign); that better future models will fix this (rebutted - non-gameability/diversity are necessary but insufficient conditions, and current failure isn't excused by hypothetical future success); and that AI use can't be enforced anyway (rebutted - the position is not prohibition but "AI assistance to human reviewers is one thing, AI replacement of human judgment is another").

## Why This Matters for Slackr

- This is a rigorously quantified, top-venue-accepted case study of exactly the failure mode Slackr is designed to avoid: an automated system rendering a bottom-line verdict on human contribution/quality. The "hivemind effect" data (correlated, homogenized machine judgment vs. distributed, more-accurate human judgment) is a strong, citable justification for why Slackr surfaces evidence rather than a per-member score.
- The gameability finding is directly analogous to a risk already flagged in the companion paper in this folder ([[2025-11-ai-contribution-conflict-framework]]/`2025-11-ai-contribution-conflict-framework.md`): "students can game the system with contradictory or misleading submissions." Paper laundering shows how cheap and effective gaming an AI judge can be even without adversarial intent, purely through stylistic polish. Any future feature that lets Slackr's AI layer score or rank member contributions should assume similar gaming risk from write-ups, commit messages, or doc edits optimized for the AI's preferences rather than for genuine work.
- The "algorithmic monoculture" framing (correlated errors from models sharing training data collapse the diversity that makes group judgment trustworthy) supports Slackr's instructor-in-the-loop model: a single AI verdict concentrates and correlates risk in a way a human reviewer looking at organized evidence does not.
- The paper's three pre-deployment requirements (adversarial robustness testing, validated accuracy, and transparency about where automation is used) are a reusable checklist if Slackr ever adds AI-generated summaries or "task fidelity" scoring (as proposed in the companion framework paper) - each such feature should be evaluated and disclosed rather than assumed safe.
- More broadly: 56% of a large surveyed population (ICLR reviewers) actively distrust AI-generated judgment of their own work. That distrust is a strong signal for the "social legitimacy" point already noted in the companion paper - tools that render verdicts, even accurate ones, risk rejection by the people being judged. Staying advisory is not just an ethical default for Slackr, it is likely a legitimacy requirement.
