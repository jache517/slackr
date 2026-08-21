# Students' Perceptions of Peer Grading

**Authors:** Uchswas Paul, Jash Shah, Keira McArthur, Aref Babaei, Niranjan Rajendran, Parvez Rashid, Edward Gehringer (North Carolina State University, plus one independent researcher and a College of Charleston co-author)
**Date:** arXiv listing July 2026 (accepted as an expanded author version for ECTEL 2026, the European Conference on Technology Enhanced Learning)
**Source:** [arXiv:2607.16221](https://arxiv.org/abs/2607.16221) (HTML: https://arxiv.org/html/2607.16221v1)
**Relevance to Slackr:** Directly on-topic. This is a large-scale synthesis of how students themselves experience peer grading and peer evaluation, the emotional and social costs, the fairness failures, and what mitigates them. It is the strongest evidence base found so far for the exact "fear of conflict / damaged relationships" bottleneck named in Slackr's own problem statement.

## Summary

The paper notes that although many individual studies have looked at students' views of peer grading, the findings are scattered and no clear overall picture has emerged. To fix that, the authors combine two data sources into one mixed-source thematic analysis: a review of prior literature, and real student discussion scraped from Reddit (an initial pool of 659 posts and 6,607 comments, filtered for relevance using a fine-tuned Gemini 2.5 text-classification model). The synthesized evidence base spans 107 papers plus roughly 114 relevant Reddit posts and 300 comments. From this they derive a set of positive and negative perception themes, then map eight mitigation strategies onto the negative themes to show which design choices address which problems.

## Key Findings

- Students see peer grading as both beneficial and problematic at the same time. Positive perceptions cluster around learning and understanding benefits, skill development, engagement, and collaboration.
- Negative perceptions cluster into roughly seven themes, including unreliable grading, unfairness, weak feedback quality, and emotional stress and workload burden.
- A meaningful share of students report reluctance to grade peers honestly: reported figures include roughly 38% of student assessors reluctant to give low marks, and roughly 22% reporting difficulty separating personal feelings from the evaluation itself.
- Roughly 30% of students fall into what the paper characterizes as a "negative-experience" group, who view peer grades as unfair, often driven by friendship-based marking or interpersonal conflict.
- On Reddit specifically, students describe concrete unfair behaviors beyond simple bias: retaliation, collusion, and strategic/tactical grading, i.e. grading peers not on merit but on social or competitive incentives.
- Emotional stress themes include fear of losing face in front of peers, anxiety about giving low grades to people they know, discomfort at being evaluated by acquaintances, and being discouraged or upset by harsh feedback, alongside worry that peer grading damages personal relationships.
- The paper identifies eight mitigation strategies (spanning training/preparation, rubrics and structured criteria, anonymity/blind review, multiple reviewers, instructor oversight and moderation, incentive design, workload management, and technology support), and finds instructor oversight/moderation and training/preparation are the most load-bearing: they are the two strategies that map onto the largest number of the seven negative-perception themes.
- Anonymity is called out specifically as a lever that reduces friendship-based bias and improves the perceived validity and reliability of the process.

## Why This Matters for Slackr

- This is direct, quantified confirmation of the exact chain of causation in Slackr's own README: "students know contribution is unequal → someone has to actively report it → fear of conflict / damaged relationships → the issue may never be raised." The ~38% reluctance-to-grade-low and ~30% negative-experience figures give a citable, order-of-magnitude sense of how common that failure mode is, not just an assumption.
- The retaliation/collusion/friendship-bias findings are a strong argument for Slackr's core design choice to source contribution evidence from artifacts (commits, PRs, doc edits, meeting attendance) rather than from peer-assigned scores. Evidence collected from tools students already use cannot be directly retaliated against or traded the way a peer rating can, though it can still be gamed in other ways (see the companion note on paper laundering, [[2026-05-stop-automating-peer-review]]).
- The mitigation-strategy ranking reinforces the value of Slackr's existing "instructor review" step in the workflow: instructor oversight/moderation is independently identified here as the single most load-bearing lever across nearly all negative-perception themes, which validates ending the Slackr pipeline at "tutor reviews evidence + student context" rather than an automated grade.
- The emotional-stress themes (fear of losing face, discomfort evaluating people you know, worry about damaged relationships) describe precisely the social cost Slackr is trying to remove by making the reporting step passive and evidence-based instead of an active, named accusation from one student against another.
- Anonymity's role in reducing friendship-based bias is a useful design signal if Slackr ever surfaces peer-provided "missing context" back to the group: keeping that context attributable to the instructor's report rather than exposed peer-to-peer would likely reduce the same retaliation/collusion risk this paper documents.
- Together with [[2025-11-ai-contribution-conflict-framework]] (which surveys 11 incumbent contribution-assessment tools and finds only one lets students add explanatory context) and [[2026-05-stop-automating-peer-review]] (which shows automated judgment of human work is both homogenized and gameable), this paper completes a three-part case for Slackr's positioning: existing peer-assessment tools carry a documented social/emotional cost that suppresses honest reporting, automating the verdict does not fix that and introduces new failure modes, and the mitigation instructors' own students say works best, oversight paired with structured evidence, is exactly what Slackr's "evidence, not verdict" pipeline is built around.

## Notes on Sourcing

This summary was compiled from the arXiv abstract page and search-indexed excerpts of the HTML full text; direct fetch of the full paper was blocked by a web-fetch rate limit at the time of writing. Percentages and thematic counts above are reported as found in indexed excerpts and should be verified against the primary PDF (https://arxiv.org/pdf/2607.16221) before being cited in any final deliverable.
