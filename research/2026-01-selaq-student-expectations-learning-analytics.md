# Exploring Student Expectations and Confidence in Learning Analytics

**Authors:** Hayk Asatryan, Malte Neugebauer, Basile Tousside, Hildo Bijl, Janis Mohr, Paul Spiegelberg, Claudia Frohn-Schauf, Jörg Frochte (Bochum University of Applied Sciences and Hochschule für Gesundheit, Germany)
**Date:** arXiv submission January 2026 (arXiv ID prefix 2601); survey fieldwork conducted Fall 2022 and Summer 2023
**Source:** [arXiv:2601.05082](https://arxiv.org/abs/2601.05082) (HTML: https://arxiv.org/html/2601.05082v1)
**Relevance to Slackr:** Not about contribution scoring or peer review directly, this is an empirical study of how students actually feel about tools that collect and analyze their activity data, exactly the category Slackr sits in from a student's point of view (GitHub commits, Google Doc edits, Meet attendance, all pulled together into a report an instructor reads). It gives Slackr its first evidence-based read on *who the skeptical users will be* and *what would earn their trust*, complementing the ethics/governance framework already in the folder ([[2026-08-league-ethical-governance-student-data]]) with actual student-reported attitudes rather than an institutional lens.

## Summary

The authors ran an adapted 12-item Student Expectation of Learning Analytics Questionnaire (SELAQ) with 553 university students across eight faculties (Computer Science, Architecture, Civil Engineering, Electro-Mechanical Engineering, Sustainability, Surveying, Business Studies, and other engineering disciplines) at a German university of applied sciences. Each question was answered twice: once for "desire" (what students *want* to happen) and once for "expectation" (what they *actually believe* will happen), split across Data Protection (DP) items and Learning Analytics (LA) functionality items. Using K-means clustering (k=4, chosen via elbow and silhouette methods) on the 24 resulting scores per student, they identified four stable attitude clusters: **Enthusiasts**, **Realists**, **Cautious**, and **Indifferent**. They then trained a CART decision tree on the same features to make cluster membership interpretable, and cross-tabulated clusters against academic discipline to see which fields skew toward which attitude.

## Key Findings

**The universal pattern - expectation always trails desire.** Across every question group (DP, general LA features, lecturer-related LA features) and every cluster, students' expectation score was lower than their desire score. Full population averages: DP desire 5.91 vs. DP expectation 5.39 (out of 7); LA desire 5.33 vs. LA expectation 4.51. In plain terms: students want more data protection and more useful analytics than they actually believe an institution will deliver. This gap is the baseline "trust deficit" any tool built on student activity data starts from.

**Trust in staff/instructors to use the data well is the weakest link.** Item 11 ("The teaching staff will have an obligation to act... if the analytics show that I am at risk of failing") scored significantly lower than every other item on the questionnaire. The paper states plainly: "students are not very convinced that their teachers provide support and optimize learning success." The general LA expectation stayed close to DP expectation, but "when shining a spotlight on the questions related to the lecturer... both the anticipation and the confidence that these anticipations will be met decrease noticeably... The effect is even stronger regarding the anticipations."

**Four clusters, with very different sizes and needs (Table 2, DP/LA desire-expectation scores out of 7):**
- **Enthusiasts** - high desire and high expectation on both DP (6.34d / 6.14e) and LA (6.01d / 5.64e). They already trust the system will deliver; the risk with this group is disappointment if it doesn't.
- **Realists** - desire is just as high as Enthusiasts (DP 6.34d, LA 5.76d) but expectation collapses (DP 4.95e, LA 3.73e - the single largest desire-expectation gap of any cluster). They want it to work but don't believe it will.
- **Cautious** - want DP but not LA: DP desire/expectation stay high (6.19d / 5.64e) while LA desire is the lowest of any cluster (3.68d / 3.75e). They're skeptical of the analytics itself, not the privacy handling.
- **Indifferent** - low, flat scores across the board (DP 3.55d / 4.02e, LA 4.24d / 3.91e) - general disengagement rather than active resistance.

**Discipline predicts attitude.** Computer Science and Engineering students split roughly 40% Enthusiast / 20% Cautious, and CS students in particular showed stronger-than-average agreement on wanting secure data handling, consent for third-party analysis, and a comprehensive learning profile - "attributed to their specialized background in information technology, where understanding and valuing data privacy and security are paramount." Architecture students skewed most heavily Realist (high desire, low trust it'll be executed well). Business students had the largest Indifferent share. Sustainability students were the most Enthusiast-leaning group in the whole sample.

## Notable Quotes

> "Without active involvement and support from students, such a system cannot be effectively utilized. Students might disapprove or actively avoid using the offered resources if they feel uncomfortable with the system."

> "It can be deduced that students are not very convinced that their teachers provide support and optimize learning success."

> "The Realists exhibit skepticism about institutional capabilities in LA; to address this, it is essential to reinforce the institution's digital competence, underscore strict DP standards and foster transparent communication to alleviate their concerns."

> "There can be multiple reasons why students express indifference towards LA and DP. Possible lack of interest or knowledge as well as the perception of insignificance of the topic are linked to the content itself."

> "Addressing this challenge involves providing specialized LA training for lecturers and promoting open, transparent discussions about LA's utility and role in the academic process."

## Why This Matters for Slackr

- Slackr is, from a student's chair, exactly a Learning Analytics tool: it collects GitHub/Google activity, aggregates it, and hands a report to an authority figure (the instructor). This paper is the first piece in the folder that measures how students who are the *subjects* of that kind of system actually feel about it, rather than proposing a framework for how institutions should govern it. The two pair well: [[2026-08-league-ethical-governance-student-data]] gives the institutional "should we" checklist, this paper gives the "will students trust it" baseline.
- The universal desire-expectation gap is a direct argument for the design choices Slackr already makes. Students don't distrust monitoring in principle, they distrust that it will be handled well. Slackr's stance of "evidence, not verdict" plus visible member context/review steps is a concrete way to close some of that gap rather than assume good faith will be extended by default.
- The weak trust specifically in *how staff will use the analytics* (item 11) is the most transferable finding for Slackr: the risk students perceive isn't the data collection itself, it's an instructor mishandling or over-relying on the output. That reinforces the case for Slackr surfacing organized evidence for instructor judgment rather than an automated score, and suggests any instructor-facing UI should make clear what the tool is (and isn't) claiming.
- The four-cluster model is directly reusable if Slackr ever surveys its own student users or writes onboarding copy: expect a sizeable "Realist" contingent who want fair contribution reporting but doubt it'll be executed fairly, and a "Cautious" contingent who are fine with the tool storing/protecting their data but skeptical the analytics itself adds value. Messaging that only addresses privacy (data protection) will miss the Cautious group; messaging that only sells the analytics value will miss the Realists.
- Caveat for citing this: the sample is discipline-skewed (STEM-heavy, one German university of applied sciences, n=553, fieldwork from 2022-2023 predating the current wave of LLM-assisted group work) and is about institutional LA generally, not peer-to-peer contribution tools specifically. Treat the cluster *proportions* as illustrative, not generalizable, but the attitude *categories* and the desire-expectation gap as a durable framing.
