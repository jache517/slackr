# Assessing Teamwork Dynamics in Software Development Projects

**Authors:** Santiago Berrezueta-Guzman, Ivan Parmacli, Mohammad Kasra Habib, Stephan Krusche, Stefan Wagner
**Date:** Submitted 21 January 2025 (arXiv); accepted at the 16th IEEE Global Engineering Education Conference (EDUCON 2025)
**Source:** [arXiv:2501.11965](https://arxiv.org/abs/2501.11965) (PDF: https://arxiv.org/pdf/2501.11965)
**Relevance to Slackr:** Directly on-topic. This is a controlled, quantitative study that does exactly what Slackr's pipeline is built to do: compare a student's self-reported contribution against objective repository evidence (GitLab commits), then measure the consequences of the gap between the two. It is the strongest available statistical evidence that self/peer-reported contribution is unreliable and that the size of that unreliability predicts worse team and individual outcomes.

## Summary

The study follows 23 student teams (roughly five members each, ~115 students) through a semester-long, six-deliverable software development project (a command-line library management system, built with GitLab for version control, merge requests, and code review). For each of the last five deliverables, the authors compare each student's self-assessed contribution (EC) against their actual share of the team's commits (RC), using the formula:

Difference = | EC_i − RC_i / Σ RC_j | × 100%

A difference above 20% is treated as a significant discrepancy between what a student believed they contributed and what the commit log shows. The authors also ran an end-of-project survey covering team leadership, conflict resolution, communication practices, and perceived fairness of workload.

## Key Findings and Quotes

- Discrepancies above 20% between self-reported and commit-measured contribution appeared repeatedly across the 23 groups, with several groups (G13, G15, G16, G20) showing high discrepancies across nearly every deliverable, and some individual groups spiking as high as 32-40% on a given assignment.
- "Teams with close alignment between self-reported and actual contributions performed better academically, with higher project grades and exam pass rates." (Finding 1)
- "Groups with high discrepancies in self-assessment often faced challenges like unclear roles, uneven task distribution, and weak communication, resulting in lower academic outcomes." (Finding 2)
- Statistically, the paper reports a strong negative correlation of **-0.83** between average self-report/commit discrepancy and project grade, a moderate positive correlation of **0.53** between project grade and the number of students passing the exam, and a moderate negative correlation of **-0.62** between discrepancy and exam pass rate. ANOVA confirms these are significant (p = 1.73×10⁻²⁷ for discrepancy vs. grade; p = 2.31×10⁻³² for grade vs. exam pass rate).
- Despite these measurable gaps, the qualitative survey results skew positive: most teams rated their overall experience "Good to Excellent," and "only one team expressed reluctance to work together again in the future," even though three teams explicitly reported imbalanced workload distribution. In other words, teams with a real, measurable contribution gap still largely did not surface it as a problem in their own self-report.
- Citing their own earlier work, the authors note that students "tend to overestimate their involvement, a bias influenced by visibility and interpretation of roles," and that "lone wolf" students who struggled to collaborate were a recurring driver of team dropouts.
- The paper's own recommendation lands squarely on Slackr's design: "Educators should implement regular feedback mechanisms and reflection exercises to encourage critical assessment of contributions... Promoting open discussions on workload allocation can prevent misunderstandings."

## Why This Matters for Slackr

- This is a direct, statistically significant demonstration of the exact failure mode in Slackr's own problem statement: students do not reliably self-report an unequal contribution, even when the underlying repository evidence shows a large, measurable gap, and even when three of the study's own teams admitted the workload was imbalanced. The paper shows the gap is silent (buried in commit logs, not raised by the team) right up until it shows up as a lower grade and lower exam pass rate.
- It gives Slackr a citable, quantified reason to prefer artifact evidence over self/peer scoring: the -0.83 correlation between discrepancy and grade is effectively an argument that the size of the self-report/reality gap is itself a leading indicator of a team in trouble, which is precisely the kind of signal an automatically collected evidence pipeline (rather than a once-per-project peer survey) could surface early instead of only at the final grade.
- It reinforces the "lone wolf" and role-visibility bias findings that show up elsewhere in this research folder: students misjudge contribution not out of malice but because visibility into teammates' work (and their own) is poor without objective tooling. This is a second, independent line of evidence (alongside [[2025-05-llm-contribution-summarization-software-projects]], which found the same self-report/visibility problem in a live classroom deployment) that automatically collected evidence, not a self-report form, is the right foundation for Slackr's pipeline.
- It complements [[2024-10-contribution-rate-imputation-theory]], which cautions that raw commit counts alone are a poor effort proxy. This paper uses raw commit share as its objective measure and still finds it strongly predictive of outcomes, suggesting that even a simple, unweighted evidence signal (commit share) is informative enough to justify Slackr's model, with CRIM-style effort-weighting as a plausible enhancement rather than a prerequisite.
- The six-deliverable, GitLab-based project structure the authors evaluated is a close real-world analog to the kind of software team project Slackr is designed for, which makes this a strong grounding citation for the "why measure this at all" section of Slackr's background research rather than a tangential education-theory paper.

## Notes on Sourcing

Findings and quotes above were pulled from the full LaTeX source of the arXiv HTML/abstract page (https://arxiv.org/abs/2501.11965), including the results tables (Table "Difference between estimated and actual contribution" and Table "Performance analysis of student groups"), the correlation/ANOVA statistics reported in the Results section, and the four numbered Findings in the Discussion section. Author affiliations were not confirmed in the fetched excerpt and should be verified against the published EDUCON 2025 proceedings before being cited in a formal deliverable.
