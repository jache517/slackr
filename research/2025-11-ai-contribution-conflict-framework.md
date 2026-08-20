# AI-Driven Contribution Evaluation and Conflict Resolution: A Framework & Design for Group Workload Investigation

**Authors:** Jakub Slapek, Mir Seyedebrahimi, Jianhua Yang (University of Warwick / Warwick Manufacturing Group)
**Date:** November 2025 (arXiv preprint)
**Source:** [arXiv:2511.07667](https://arxiv.org/abs/2511.07667)
**Relevance to Slackr:** Directly on-topic. Proposes a framework for automatically collecting and organising evidence of student group contribution across code, chat, meetings, and peer assessment, then using AI to flag conflict/disparity for instructor review, without the tool itself issuing a verdict. This mirrors Slackr's "evidence, not verdict" positioning almost exactly.

## Summary

The paper addresses a problem nearly identical to Slackr's premise: individual contribution in group work is hard to assess fairly, disputes are costly to adjudicate manually, and current peer-assessment tools mostly rely on self/peer ratings that suffer from popularity bias and don't help resolve conflict. The authors survey 11 widely-used peer/contribution assessment tools (CATME, SPARK/PLUS, WebPA, RiPPLE, Peerceptiv, TEAMMATES, Buddycheck, iPeer, Eduflow, InteDashboard, FeedbackFruits), then propose a new conflict-assessment framework and a matching AI/LLM-based implementation architecture.

## Key Findings from the Tool Survey (Section 3)

- 91% of surveyed tools use an "AutoRating"-derived normalisation (a "relative performance factor" / "group factor") to convert peer ratings into individual marks.
- 82% use Likert-scale rubrics.
- Only 45% incorporate any notion of reviewer reliability.
- Only 45% have early-warning systems (flagging high/low performers, cliques, conflict via standard deviation/skew).
- Only 18% use AI at all, and only for screening submissions or judging reviewer helpfulness, not contribution evaluation itself.
- 64% offer dashboards/visualisations; 64% integrate with an LMS (Moodle, Canvas).
- **Gap identified:** "Only Peerceptiv allowed for students to add explanatory evidence (though no additional analysis is given). Thus, there is a deficiency in current tools towards AI integration and conflict investigation features."

## The Proposed Framework

Evidence is categorised into three sources:
1. **Submission** - code, text, multimodal work
2. **Conversation** - discussion logs, email, meeting minutes
3. **Coordination** - personal circumstances, artefacts, task descriptions, peer assessment

These feed into **three benchmark dimensions, nine total benchmarks**:

- **Contribution:** Quantity, Quality, Relevance
- **Interaction:** Tone, Effectiveness, Presence
- **Role:** Adherence, Organisation, Support

For each benchmark the paper lists concrete metrics (e.g. commit count, net lines changed, word/character count, message count, response latency, sentiment, attendance, task fidelity via LLM-extracted goal matching) that are normalised (via AutoRating-style scaling) and aggregated with adjustable weighted masks into per-dimension scores.

### Conflict Markers via Gini Index

A distinctive technical contribution: the authors compute the **Gini index** on each base measure to quantify inequality of contribution across a team, then define two conflict scenarios:
- **Scenario A** - high Gini + above-average individual score → isolated high performer (possible over-centralisation / "hogging" tasks, or a stronger member propping up the team)
- **Scenario B** - low Gini + below-average score → isolated low performer (classic social loafing / free-riding)

This gives a lightweight, quantitative way to auto-flag teams worth an instructor's attention, rather than scoring individuals directly - closely aligned with Slackr's "surface evidence, don't render a verdict" principle.

### LLM Role

An LLM layer is used for two things: (1) deriving abstract/qualitative metrics that are hard to compute directly - e.g. "task fidelity" (relevance of meeting outcomes to project goals) and quality grading against a rubric - and (2) producing a final "expert analysis" advisory judgment via hierarchical prompts with double-pass validation to reduce hallucination, explicitly framed as advisory rather than a final grade.

## Notable Quotes

> "Common practice assigns grades equally among team members, which can lead to negative reactions from students, and does not reflect the typical industry experience."

> "AutoRating systems and web-based peer-assessment platforms enable peers to report relative contributions and automate assessment based on rubrics via instruments; however, these increase administrative load, suffer from subjective popularity effects, and aid minimally in conflict resolution."

> "A major driver of unfairness is Social Loafing: 'students who don't take responsibility for their own role, even if it is the smallest role in the group,' often leading to an over-reliance on stronger students who resent others for gaining credit for what they perceive as their own contribution."

> "Whilst it has been shown that normalisation is an effective fix for generosity bias and yields measurably fairer grades, a minority of students react negatively because the algorithm feels like it over-rides their personal judgements. Therefore, beyond procedural fairness, tools must also earn social legitimacy to balance technocracy."

> "The system must maintain an assistive/advisory stance and cannot provide direct judgment, which may indirectly limit assistance ability."

> "We hope this AI-driven interpretation of results diminishes the inherent distrust in technocratic solutions, offers value to investigations, and decreases administrative load."

## Policy / Compliance Notes (Section 6, UK-specific but transferable)

- Under UK GDPR / the EU AI Act, tools that evaluate learning outcomes are treated as higher-risk AI systems requiring transparency and a "human-in-the-loop."
- Where a tool stays advisory (doesn't itself render a final decision), it is legally "profiling" rather than "automated decision-making," which carries a lighter compliance burden, but institutional policy (e.g. University of Leicester's AI policy) still requires that "the marks and feedback for each student will be reviewed by the relevant expert member of staff."
- Using assessment data for its original assessment purpose generally does not require separate ethical approval, but may still require a Data Protection Impact Assessment (DPIA).

## Limitations Acknowledged by the Authors

1. Missing or uncategorisable evidence reduces accuracy.
2. Students can game the system with contradictory or misleading submissions.
3. Large cultural/linguistic/personal differences are not well accounted for.
4. Practical integration challenges: reconciling identity across data sources, judging multimodal contribution quality, exporting/parsing heterogeneous platform data.

## Why This Matters for Slackr

- Validates the "evidence categories → objective metrics → flag disparity → human review" pipeline shape Slackr is already pursuing.
- The Gini-index-based conflict marker is a concrete, cheap technique worth considering for surfacing "who might need a closer look" without scoring individuals outright.
- The three-dimension / nine-benchmark taxonomy (Contribution / Interaction / Role) is a reusable structure for organising what evidence Slackr collects from GitHub, Docs, and meetings.
- The paper's UK policy review is a useful template for thinking through data-governance and "human-in-the-loop" framing if Slackr ever operates in an institutional/EdTech context.
- Confirms the market gap Slackr is targeting: of 11 major incumbent tools, none combine AI-driven analysis of raw collaboration evidence with conflict-flagging in the way Slackr proposes.
