# tAIfa: Enhancing Team Effectiveness and Cohesion with AI-Generated Automated Feedback

**Authors:** Mohammed Almutairi, Charles Chiang, Yuxin Bai, Diego Gomez-Zara (University of Notre Dame)
**Date:** Submitted 19 April 2025 (arXiv preprint); published at CHIWORK '25, the 4th Annual Symposium on Human-Computer Interaction for Work, June 23-25, 2025, Amsterdam, Netherlands
**Source:** [arXiv:2504.14222](https://arxiv.org/abs/2504.14222) (HTML: https://arxiv.org/html/2504.14222), DOI: https://doi.org/10.1145/3729176.3729197. Code: https://github.com/RINGZ-Lab/taifa
**Relevance to Slackr:** Directly on-topic, and a useful complement rather than duplicate of the peer-grading/peer-review papers already in this folder. tAIfa is not about scoring or ranking individual contribution: it is an LLM agent that reads a team's existing Slack conversation and turns it into individual and team-level feedback messages, with no peer ratings or manual reporting involved. This is close to Slackr's own "observe evidence, don't render a verdict" design, but applied to real-time communication behavior rather than end-of-project contribution evidence, and it is the first paper in this folder with a controlled experiment (18 teams) measuring whether automated, evidence-derived feedback actually changes team behavior.

## Summary

The paper introduces tAIfa ("Team AI Feedback Assistant"), an LLM-based Slack bot that reads a team's ongoing conversation, scores it on seven communication metrics grounded in small-group research, and then generates personalized natural-language feedback: a private message to each individual and a public message to the whole channel. Critically, tAIfa is built to work from conversational evidence alone (no prior user data, no self- or peer-ratings) and to stay purely advisory, sitting downstream of the team's own communication rather than replacing any judgment role. The authors first ran a formative study (30 Prolific participants, 9 candidate prompt designs varying message length and amount of context) to identify which feedback style people rate as clearest, most actionable, and least robotic. They then ran a preregistered between-subjects lab experiment: 54 participants organized into 18 three-person teams completed three "survival ranking" tasks in Slack, with 10 teams receiving tAIfa feedback after each task and 8 teams receiving none.

## The Seven Communication Metrics (Table 1)

Three are computed directly from text (no LLM judgment needed):
- **Language Style Matching (LSM)** - similarity in function-word usage (articles, pronouns, conjunctions) between an individual and the team, computed as `1 - |P_U - P_T| / (P_U + P_T + epsilon)`; higher = more linguistic alignment.
- **Sentiment** - VADER compound score (-1 to 1) of the conversation's emotional tone.
- **Team Engagement** - each member's word count as a percentage of total team word count, used to flag imbalanced participation.

Four are contextual/latent constructs the paper has an LLM judge directly from the transcript, rather than trying to hand-code with keyword rules:
- **Transactive Memory System (TMS)** - whether members correctly recognize and delegate to each other's expertise.
- **Collective Pronoun Usage** - how often contributions are framed as part of a shared "we" effort (evaluated by LLM rather than simple keyword-matching, since e.g. "you and I make a great team" signals collaboration without using "we").
- **Communication Flow** - turn-taking, response delays, interruptions, jointly assessed from timestamps and semantic content (so a natural pause isn't misclassified as disengagement).
- **Topic Coherence** - how well the conversation stays aligned with the team's stated task goal.

## Key Findings

**Prompt design (formative study, n=26 after exclusions):** Message length and context level both significantly affected perceived feedback quality. For individual feedback, medium-length + medium-context prompts scored highest (M=3.94/5, SD=0.68); for team feedback, long + medium-context scored highest (M=3.97/5, SD=0.66). Short, low-context messages were rated worst in both cases. Cronbach's alpha for the 8-item quality scale ranged 0.84-0.94 across all 9 prompt variants.

**Main experiment (18 teams, 54 participants):**
- Conversation duration: no difference in Task 1, but by Task 3 treatment teams talked 35% longer than control teams (8.80 vs 6.50 min), a significant repeated-measures effect (F(1,154)=4.21, p<0.05, d=0.57).
- Speaker turn frequency: treatment-team members took 32% more turns than control-team members by Task 3 (7.10 vs 5.36 exchanges), significant (F(1,154)=5.74, p<0.05).
- Total word count: treatment teams used 26% more words in both Tasks 2 and 3, but this difference was not statistically significant (F(1,154)=2.78, p>0.05).
- Task performance: treatment teams scored higher in all three rounds, with the largest gap in Task 3 (56.7% vs 45.8%), but the difference was not statistically significant (t(15.80)=-0.93, p>0.05) - feedback changed communication behavior more clearly than it changed task outcomes.
- Self-reported team cohesion, satisfaction, and viability were not significantly different between conditions, and were numerically slightly lower in the treatment group by the final round (e.g. cohesion 4.16 vs 4.23, satisfaction 4.46 vs 4.57) - more talking did not translate into people feeling closer as a team.
- Perceived effort (NASA-TLX) was significantly higher for treatment participants (F(1,149)=15.36, p<0.05), i.e. reading and processing the AI feedback cost people something, though this converged with the control group by Task 3, suggesting a one-time adjustment cost.
- Only 2 of 30 treatment participants reported missing the feedback in one round (attention-check), so the null/mixed results are not attributable to people ignoring the messages.
- Participants rated tAIfa's team feedback (M=3.95/5) and individual feedback (M=3.90/5) as similarly helpful, usability was rated M=3.88/5 (SUS), explainability moderate at M=3.44/5, and a direct comparison to a human manager's feedback was the lowest-rated item (M=3.07/5) - people liked it, but didn't think it beat a person yet.

## Notable Quotes

> "TAIFA analyzes team interactions, identifies strengths and areas for improvement, and delivers targeted feedback based on communication patterns... Our findings show that TAIFA improved communication and contributions within the teams."

> "While these existing tools offer valuable assistance, many rely on simple heuristics and overlook the deeper context and semantics of team interactions. This simplicity can lead users to 'game' the system, making superficial adjustments to their behavior without achieving meaningful improvement."

> "A key design goal is to generate feedback exclusively from ongoing conversations, avoiding relying on preexisting user data. By drawing primarily on the immediate context, we aim to create a tool that is generalizable across diverse domains and minimizes users' preexisting data."

> P20, on receiving tAIfa feedback: "...was very detailed in highlighting what we really needed to improve and got us going."

> P15, on the AI's lack of an emotional filter: "TAIFA does not have any emotional filter, so I was able to hear the absolute truth, unlike how a human would 'tiptoe' around others' feelings."

> P18, on the same tradeoff: tAIfa "is missing human touch and empathy." Other participants described the feedback as "impersonal" (P26), "monotonous" (P27), and "wasn't always the kindest" (P22).

> P7: "I noticed each time there was about 20 percent of information he [the agent] provided [sic] was inaccurate" - on the agent occasionally misreading context or slang.

> On what the feedback did *not* do: "TAIFA's prompts focused on language use, understanding of each other's skills and ideas, and participation, but did not assess which members' actions could have improved, whether they made mistakes... Neither did it provide specific strategies nor instructions for solving the task more effectively."

## Limitations Acknowledged by the Authors

- No interactivity: tAIfa delivers a one-way message with no ability for users to ask follow-up questions or dispute the read.
- Task mismatch: feedback covered communication style, not task-specific strategy, which the authors identify as the likely reason performance gains didn't reach significance.
- Anonymized aliases (rather than real names) may have made the feedback feel less personal and could have blunted its impact.
- Communication metrics alone miss cognitive/behavioral aspects of teamwork such as reasoning quality or contribution substance, not just its volume or tone.
- Small sample (54 participants, mostly undergraduates), single institution, short single-session tasks with strangers - generalizability to real, ongoing workplace or student teams is untested.

## Why This Matters for Slackr

- This is the clearest empirical existence-proof in this folder that an LLM reading a team's own communication channel (no self-report, no peer rating) can generate feedback people find clear, useful, and worth acting on, directly supporting Slackr's "evidence, not verdict" pipeline design applied to a different data source (chat, not commits/docs/meetings) and a different purpose (behavioral nudge, not a contribution report). It is a concrete precedent for the "evidence in, LLM-summarized signal out, human/team stays in control" architecture Slackr is built around, alongside [[2025-11-ai-contribution-conflict-framework]]'s framework and [[2025-10-trace-ai-assisted-collaborative-assessment]]'s repo-mining approach.
- The mismatch between "communication improved" and "cohesion/satisfaction did not" is an important caution: making imbalance visible (who talked how much, how evenly) changed behavior in the room, but did not automatically make people feel better about the team, and if anything trended slightly negative on cohesion. If Slackr surfaces per-member evidence (commit counts, doc edits, meeting presence) to a team mid-project rather than only at the end, this paper suggests that surfacing an imbalance metric can shift behavior without improving how the team feels about each other, so framing and tone of any such surfaced evidence matters as much as the underlying accuracy.
- The "torpedo reviewing" (gaming) risk flagged in [[2026-05-peerbts-strategyproof-peer-selection]] and [[2025-11-ai-contribution-conflict-framework]] gets a lighter but related echo here: this paper's own related-work section notes that heuristic-based team-feedback tools risk being gamed via "superficial adjustments to behavior without achieving meaningful improvement" (e.g. talking more without contributing more substance). This is a good reminder that any Slackr signal derived from *volume* alone (commit count, message count, word count) is exposed to the same shallow-gaming risk as tAIfa's word-count-based Team Engagement metric, reinforcing the case for combining quantity signals with qualitative ones, as the contextual (LLM-judged) metrics in this paper attempt to do for communication and as [[2025-11-ai-contribution-conflict-framework]]'s Contribution/Interaction/Role taxonomy attempts to do for group work generally.
- The perceived-effort finding (feedback costs users real cognitive effort to process, converging to baseline only after repeated exposure) is a concrete, measured data point for the UX cost of any automatically generated report Slackr shows to students or instructors: a first exposure to an AI-generated evidence summary should be expected to add friction, not none, even when eventually well received.
- Practical design detail worth borrowing directly: tAIfa's decision to separate feedback into a private per-individual message and a distinct public team-level message is a clean template for how Slackr might structure a Group Contribution Report's presentation, separating "what this person did" from "what the team looked like overall," without requiring the individual-level message to be visible to teammates.

## Notes on Sourcing

This summary is based on a full read of the arXiv HTML version of the paper (all sections: introduction, related work, feedback message design and formative study, system architecture, main experiment design, quantitative and qualitative results, discussion, limitations, and appendices A-B), retrieved directly from arxiv.org. Figures (system diagram, ratings charts, example feedback screenshot) could not be rendered as images in this text-only pull, but all numeric results are taken from the reported statistics and tables in the text, not inferred from the figures. This is a peer-reviewed conference paper (CHIWORK '25, ACM), not a preprint-only workshop paper, and includes a preregistration (https://aspredicted.org/wydq-dpgy.pdf) and IRB approval (#24-02-8358), which is stronger methodological grounding than most items in this folder to date.
