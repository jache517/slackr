# From Coders to Critics: Empowering Students through Peer Assessment in the Age of AI Copilots

**Authors:** Santiago Berrezueta-Guzman, Stephan Krusche, Stefan Wagner (Technical University of Munich)
**Date:** arXiv listing May 2025 (arXiv:2505.22093)
**Source:** [arXiv:2505.22093](https://arxiv.org/abs/2505.22093) (HTML: https://arxiv.org/html/2505.22093)
**Relevance to Slackr:** Direct empirical match. This is a large-scale, quantitative field study of structured peer assessment in a real programming course, comparing peer-assigned grades to instructor grades with actual statistics (correlation, MAE, RMSE) rather than only self-reported perceptions. It gives Slackr a concrete, citable data point for exactly how accurate peer-assigned scores are, and how students behave when asked to grade each other, which sharpens the case for evidence-based reporting over peer scoring.

## Summary

The authors ran a structured, anonymized peer review process in a large introductory programming course (47 teams of three students) at TU Munich. After a 10-week team project (building a 2D maze game), each team anonymously reviewed two other teams' projects using a detailed rubric covering gameplay, UI, sound, graphics, code structure, and documentation. Every project was also graded by instructors on the same rubric. The paper's stated motivation is the rise of AI coding copilots (ChatGPT, GitHub Copilot): as AI makes it harder to judge a student's individual understanding from their code alone, the authors position peer assessment as an alternative signal, and they wanted to know if that signal is actually reliable.

They report two kinds of results: a reliability analysis (statistically comparing peer scores to instructor scores) and a reflexive analysis (a post-review survey capturing how students felt about grading their peers).

## Key Findings

- **Peer grades only moderately track instructor grades.** Peer Review round 1: Pearson r = 0.55, MAE = 9.18, RMSE = 14.87 (on a 100-point scale). Peer Review round 2: r = 0.50, MAE = 10.68, RMSE = 16.36. The paper's own framing: "these results indicate that while peer assessment can often approximate instructor evaluations, variability remains a concern."
- **Peers under-rate, not over-rate.** No team self-reported being "overly lenient." 55% called their own grading "normal," 32% called it "strict" or "very strict." This was corroborated by the score-distribution plot, which showed peer scores skewed below rather than above the instructor's line.
- **Students expected leniency from peers that didn't materialize.** 49% of teams expected a higher grade from peers than instructors would give; only 30% expected lower. The actual skew ran the other way.
- **100% of teams believed their own evaluations were fair**, even while many simultaneously expected (wrongly) that peers would be softer graders than instructors, an internal inconsistency the paper flags but doesn't fully resolve.
- **Self-assessment accuracy was high.** In a reflective "is this game better than yours?" question, 82% of teams' answers matched what the final grades actually showed, evidence that structured comparison prompts can produce reasonably self-aware judgments.
- **Students strongly preferred a rule that protects them from a bad peer score.** 68% preferred using the *highest* of the peer scores they received (not the average) if their peer and instructor grades diverged, "citing concerns about receiving an unfairly low score from a single reviewer." Only 26% preferred averaging.
- **Engagement was high but not universal.** 83% of teams reported enjoying being an evaluator; 4% did not, mainly citing incomplete/broken peer projects making the review frustrating.
- The authors' own conclusion is measured, not triumphant: peer review is "a reasonably accurate proxy for instructor evaluation," not a replacement for it, and they call for reviewer training, calibration exercises, or "tutor-assisted scoring" to close the reliability gap.

## Why This Matters for Slackr

- This paper supplies the strongest quantitative evidence yet in this research folder that peer-assigned *scores* have real, measurable error against ground truth (MAE ~9-11 points on a 100-point scale, r ≈ 0.5-0.55), even under close-to-ideal conditions: anonymized, rubric-based, justification required, and run in a course explicitly designed around fair evaluation. If a well-designed, well-incentivized academic peer-grading pilot still lands at only moderate correlation with instructor judgment, that is a strong argument against building Slackr around any mechanism that outputs a peer-derived contribution *score*, and reinforces the project's existing "evidence, not verdict" stance.
- The finding that 68% of teams want the *most favorable* peer score used, not the average, in case of disagreement is a concrete illustration of a self-serving bias risk in peer-assigned numbers: students don't just grade imperfectly, they also have clear preferences for how disputed numbers should be resolved in their own favor. This strengthens the case in [[2026-05-stop-automating-peer-review]] and [[2026-07-students-perceptions-peer-grading]] that any scoring layer is gameable at the aggregation stage, not just at the grading stage.
- The mismatch between what teams expected (peers would be lenient) and what actually happened (peers skewed strict) is a useful caution against assuming any particular direction of bias in peer input; it argues for treating peer-supplied context as one input for instructor review rather than a self-correcting signal, consistent with Slackr's workflow of instructor-reviewed evidence plus member-added context.
- The 82% self-assessment accuracy result is a genuinely positive signal that structured comparison prompts elicit real self-awareness, which is relevant if Slackr ever wants a lightweight "how did your contribution compare to your teammates'" reflection field alongside its observable evidence, without going as far as a numeric peer grade.
- Because this is a CS/programming course using GitHub-adjacent team projects, it's a closer methodological analogue to Slackr's own target use case (student software teams) than the more general peer-grading literature already in this folder, and it's the first paper here to publish exact peer-vs-instructor error statistics rather than only survey-based perception data.

## Notes on Sourcing

This summary was compiled directly from the arXiv HTML full text (https://arxiv.org/html/2505.22093), including the results tables and reflexive-survey percentages reported in the paper's Results and Discussion sections. All statistics above (correlation, MAE, RMSE, survey percentages) are quoted or closely paraphrased from the source text, not inferred.
