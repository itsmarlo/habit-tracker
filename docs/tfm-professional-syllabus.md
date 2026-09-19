# Professional Syllabus: Tabular Foundation Models

Version: 1.0 — 19 September 2026  
Default pace: 32 weeks, 10–12 focused hours per week

## Objective

Reach professional proficiency in tabular foundation models (TFMs): select, evaluate, explain, deploy, and critically research them against strong tabular baselines. Finishing readings is not mastery. Progress requires passing practical and oral-style gates with reproducible evidence.

## What “professional proficiency” means

By the end, the learner can:

1. Frame a real tabular problem, define the prediction unit and deployment population, and detect leakage.
2. Choose defensible train/validation/test splits for IID, grouped, temporal, and shifted data.
3. Build strong linear, random-forest, XGBoost/LightGBM/CatBoost, and neural baselines.
4. Explain transformers, in-context learning, meta-learning, Bayesian posterior prediction, and prior-data fitted networks (PFNs).
5. Use and diagnose TabPFN, TabICL, and at least one other TFM family.
6. Compare models fairly under matched data, tuning, ensembling, latency, memory, and compute budgets.
7. Evaluate discrimination, ranking, calibration, uncertainty, subgroup performance, and robustness.
8. Read a paper adversarially: separate evidence from marketing, find confounders, and identify limits to external validity.
9. Package a reproducible experiment and communicate a recommendation to both technical and business audiences.
10. Know when *not* to use a TFM.

## Non-negotiable evaluation rules

- A test set is touched once for the final estimate. Repeated test-set consultation is test-set training.
- Preprocessing, imputation, feature selection, calibration, and threshold selection are fitted inside the appropriate training fold.
- Splits reflect the deployment process; random cross-validation is not an automatic default.
- Every TFM comparison includes strong boosted-tree and simple-model baselines.
- Compute and tuning budgets are reported. A pretrained model's pretraining cost and possible benchmark contamination are discussed even when they cannot be measured.
- Mean scores without uncertainty, per-dataset results, or practical effect sizes are insufficient.
- Accuracy alone is unacceptable for imbalanced or decision-sensitive classification.
- Explanations from SHAP or similar tools are not automatically causal.
- Claims such as “state of the art” require a defined benchmark, date, protocol, and source.

## Assessment system

Every substantial submission is scored out of 100:

| Dimension | Weight | What is judged |
|---|---:|---|
| Problem formulation and statistical validity | 25 | Target, unit, estimand, leakage, split, uncertainty |
| Experimental design and baselines | 25 | Fairness, budgets, ablations, metrics, reproducibility |
| Technical understanding | 20 | Correct mechanisms, assumptions, mathematics |
| Implementation quality | 15 | Reliable pipeline, tests, seeds, environment, readable code |
| Critical reasoning | 10 | Alternative explanations, limitations, failure analysis |
| Communication | 5 | Precision, visual clarity, calibrated conclusions |

Passing score: 80/100 overall, with at least 70% in every dimension. A submission automatically fails if it contains material target leakage, tunes on the test set, uses an invalid split for the deployment setting, fabricates results/citations, or makes a decision claim unsupported by the metric. A failed gate is revised and defended before progression.

## Weekly operating rhythm

Use a 40/40/20 split:

- 40% implementation and experiments
- 40% reading, derivations, and concept reconstruction
- 20% written criticism and explanation

Each week produces: a one-page learning note written from memory, an executable experiment, an error log, and answers to five closed-book questions. Every fourth week includes a cumulative oral-style defense and a small replication.

## Phase 0 — Diagnostic and setup (Week 0)

### Topics

Python, NumPy/pandas or Polars, scikit-learn pipelines, probability, optimization, supervised learning, validation, Git, and reproducible environments.

### Deliverable

Complete the diagnostic exam at the end of this syllabus without external help, then implement a leakage-safe classification baseline on one mixed-type dataset.

### Gate

Score determines placement; it does not punish missing prior knowledge. Any uncertainty disguised as certainty is penalized more than an explicit “I do not know.”

## Phase 1 — Statistical and tabular ML foundations (Weeks 1–5)

### Topics

- Prediction versus inference; data-generating processes and deployment populations
- Bias–variance, regularization, likelihood, cross-entropy, proper scoring rules
- Linear/logistic models, trees, random forests, gradient boosting
- Missingness mechanisms, categorical variables, heavy tails, class imbalance
- IID, stratified, grouped, nested, and temporal validation
- AUROC, average precision, log loss, Brier score, calibration, decision thresholds

### Build

A reusable evaluation harness supporting grouped and temporal splits, fold-local preprocessing, multiple metrics, confidence intervals, and experiment metadata.

### Gate 1

On three datasets, compare a dummy model, regularized linear model, random forest, XGBoost or LightGBM, and CatBoost. Defend the split, metrics, tuning budget, and uncertainty estimates. Required score: 80.

## Phase 2 — Strong baselines and empirical discipline (Weeks 6–10)

### Topics

- Functional gradient boosting and tree inductive biases
- Native versus encoded categorical handling
- Hyperparameter optimization and selection bias
- Ensembling and why validation overfitting can make ensembles look stronger
- Dataset meta-features and conditional model selection
- Benchmark design, critical difference, paired comparisons, and practical significance

### Build

Reproduce one result from a respected tabular benchmark on at least five datasets. Add wall-clock time, peak memory, calibration, and per-dataset rankings.

### Gate 2

Write a four-page replication report. A leaderboard screenshot is not evidence. Required score: 82.

## Phase 3 — Neural networks for tables (Weeks 11–14)

### Topics

- MLP optimization and regularization
- Numerical embeddings and categorical embeddings
- ResNet-like tabular networks and FT-Transformer
- Attention, permutation properties, feature and row interactions
- Why trees often excel on irregular, uninformative, skewed, or heavy-tailed features
- RealMLP and strong defaults

### Build

Implement a small MLP and attention-based tabular model, then compare them with strong tree baselines under matched tuning budgets.

### Gate 3

Explain, without notes, why “deep learning beats trees” and “trees beat deep learning” are both scientifically weak universal claims. Support the answer with experimental evidence. Required score: 82.

## Phase 4 — Foundations of TFMs and PFNs (Weeks 15–20)

### Topics

- Meta-learning, amortized inference, task distributions, and in-context learning
- Bayesian posterior predictive distributions
- Synthetic structural causal model priors and prior–data mismatch
- PFN training objectives and transformer inference over labeled context rows
- Zero-shot prediction versus fine-tuning
- TabPFN architecture and ecosystem
- TabICL distribution-aware embeddings and scaling
- Real-data pretraining and retrieval in TabDPT
- LLM serialization approaches versus tabular-native TFMs

### Build

1. Create a toy PFN-style experiment using synthetically sampled tasks.
2. Benchmark current TabPFN and TabICL releases against CatBoost, XGBoost/LightGBM, and a strong MLP on 10 heterogeneous datasets.
3. Perform controlled stress tests for sample size, feature count, irrelevant features, missingness, cardinality, imbalance, and covariate shift.

### Gate 4

Derive the connection between the pretraining objective and posterior predictive approximation, state the assumptions, and demonstrate a prior-mismatch failure. Required score: 85.

## Phase 5 — Trustworthy evaluation and responsible use (Weeks 21–25)

### Topics

- Calibration and post-hoc calibration without leakage
- Conformal prediction and its exchangeability assumptions
- Distribution shift, out-of-distribution detection, and robustness
- Subgroup evaluation, fairness definitions, privacy, memorization, and contamination
- Interpretability: permutation importance, PDP/ALE, SHAP, interactions, and their limits
- Dataset documentation and model cards

### Build

Create a “red-team suite” that deliberately introduces duplicate entities, temporal leakage, shifted categories, label noise, missingness shift, irrelevant features, and subgroup imbalance. Measure how conclusions change.

### Gate 5

Audit a TFM study or technical report. Identify at least five threats to validity, test two empirically, and distinguish confirmed problems from hypotheses. Required score: 85.

## Phase 6 — Production and decision science (Weeks 26–28)

### Topics

- Latency, memory, batching, CPU/GPU behavior, and cost
- Versioning pretrained weights and dependency/licensing review
- Monitoring schema drift, feature drift, calibration, and delayed labels
- Retraining/re-evaluation policies and fallback models
- Decision thresholds, asymmetric costs, and human review

### Build

Package one model behind a batch or service interface with input validation, monitoring signals, a reproducible model card, and a tree-based fallback.

### Gate 6

Run a pre-production review covering statistical, operational, ethical, and licensing risks. Required score: 85.

## Phase 7 — Capstone (Weeks 29–32)

Choose a real domain problem with mixed feature types and a non-trivial split (grouped, temporal, multi-site, or shifted). Compare at minimum:

- dummy and regularized linear baselines;
- CatBoost and one other boosted-tree system;
- one strong neural baseline;
- two TFM families;
- a justified ensemble, if it adds value.

Required artifacts: problem statement, datasheet, preregistered evaluation plan, reproducible repository, result tables with uncertainty, ablations, failure analysis, model card, 10-minute presentation, and a two-page executive recommendation.

### Final standard

Minimum 85/100, no automatic-fail defect, and successful defense against adversarial questions. “Best metric” is not enough: the recommendation must account for reliability, compute, latency, maintainability, license, and decision cost.

## Core source sequence

### Foundations and evaluation

1. *An Introduction to Statistical Learning* — use classification, resampling, regularization, trees, and boosting chapters: https://www.statlearning.com/
2. scikit-learn User Guide — pipelines, model selection, metrics, calibration, inspection: https://scikit-learn.org/stable/user_guide.html
3. Chen & Guestrin, “XGBoost: A Scalable Tree Boosting System”: https://doi.org/10.1145/2939672.2939785
4. Prokhorenkova et al., “CatBoost: unbiased boosting with categorical features”: https://proceedings.neurips.cc/paper/2018/hash/14491b756b3a51daac41c24863285549-Abstract.html
5. Molnar, *Interpretable Machine Learning*: https://christophm.github.io/interpretable-ml-book/

### Tabular deep learning and benchmarking

6. Gorishniy et al., “Revisiting Deep Learning Models for Tabular Data”: https://proceedings.neurips.cc/paper/2021/hash/9d86d83f925f2149e9edb0ac3b49229c-Abstract.html
7. Grinsztajn et al., “Why do tree-based models still outperform deep learning on typical tabular data?”: https://proceedings.neurips.cc/paper_files/paper/2022/hash/0378c7692da36807bdec87ab043cdadc-Abstract-Datasets_and_Benchmarks.html
8. McElfresh et al., “When Do Neural Nets Outperform Boosted Trees on Tabular Data?”: https://proceedings.neurips.cc/paper_files/paper/2023/hash/f06d5ebd4ff40b40dd97e30cee632123-Abstract.html
9. Holzmüller et al., “Better by default: Strong pre-tuned MLPs and boosted trees on tabular data”: https://proceedings.neurips.cc/paper_files/paper/2024/hash/2ee1c87245956e3eaa71aaba5f5753eb-Abstract.html
10. TabArena living benchmark paper and reproducible system: https://proceedings.neurips.cc/paper_files/paper/2025/hash/1697e3fb412da11dc9488249f9e7bbc9-Abstract-Datasets_and_Benchmarks_Track.html

### TFM core

11. Molnar, *Tabular Foundation Models: A Short and Opinionated Guide* (2026). Assigned orientation text: `/Users/marla/Documents/E-Books/TFM/1789651031254.pdf`. Online edition: https://tabularfoundationmodels.com/
12. Nagler, “Statistical Foundations of Prior-Data Fitted Networks”: https://proceedings.mlr.press/v202/nagler23a.html
13. Hollmann et al., “Accurate predictions on small data with a tabular foundation model”: https://www.nature.com/articles/s41586-024-08328-6
14. Qu et al., “TabICL: A Tabular Foundation Model for In-Context Learning on Large Data”: https://proceedings.mlr.press/v267/qu25d.html
15. Ma et al., “TabDPT: Scaling Tabular Foundation Models on Real Data”: https://proceedings.neurips.cc/paper_files/paper/2025/hash/fc0e3f908a2116ba529ad0a1530a3675-Abstract-Conference.html
16. Official TabICL implementation: https://github.com/soda-inria/tabicl
17. TabPFN official documentation: https://github.com/PriorLabs/TabPFN

### How we will use Molnar's book

Read Chapters 1-5 during Weeks 15-16 for intuition about PFNs, in-context learning, attention over tables, synthetic task priors, and the Bayesian interpretation. Reproduce one example from Chapters 6-9 during Week 17. Read Chapters 10-12 as an explicitly opinionated forecast, not as settled evidence.

For the reproduction, strengthen the book's illustrative protocol:

- replace the single classification/regression split with repeated or nested evaluation;
- report uncertainty and per-split results rather than one favorable score;
- include simple, boosted-tree, and strong neural baselines under documented budgets;
- for forecasting, replace the single final-week comparison with rolling-origin backtesting;
- evaluate calibration conditionally where possible, not only aggregate coverage;
- record package/model versions, hardware, ensemble size, and inference cost;
- test whether conclusions survive alternative seeds and context choices.

Critical-reading assignment: classify ten claims from the book as definition, mechanism, empirical observation, extrapolation, or opinion. For every empirical or forward-looking claim, locate the cited primary source and state what evidence would falsify it. Pay particular attention to “no hyperparameter tuning,” benchmark superiority, calibrated uncertainty, extrapolation, and the prediction that TFMs will consolidate tabular machine learning.

### Frontier tracking

- Prior Labs technical reports, including current TabPFN releases: https://priorlabs.ai/technical-reports
- TabArena leaderboard and code: https://tabarena.ai/
- Proceedings of NeurIPS, ICML/PMLR, ICLR/OpenReview, and JMLR

Frontier reports from model vendors are useful but are not neutral evidence. Reproduce key claims and prefer independent benchmarks. Version numbers, licenses, row/feature limits, and leaderboard ranks change quickly; record the access date and exact package/model version in every experiment.

## Diagnostic exam (closed book, 90 minutes)

Answer in your own words. If unsure, say exactly what is uncertain.

1. A hospital dataset contains multiple visits per patient over four years, and the model will be deployed next year at two unseen hospitals. Design the train/validation/test protocol and justify every boundary.
2. Explain target leakage, selection bias, dataset shift, and test-set overfitting. Give a distinct tabular example of each.
3. For a 1% prevalence fraud problem, compare accuracy, AUROC, average precision, log loss, Brier score, and expected decision cost. Which would you report and why?
4. Explain gradient boosting from the perspective of fitting residuals or negative gradients. Then explain what CatBoost's ordered target statistics are intended to prevent.
5. What inductive biases can make boosted trees stronger than neural networks on ordinary tabular data? Give at least three.
6. Describe a transformer in enough detail to account for query, key, value, attention weights, positional or structural information, residual connections, and normalization.
7. Explain a PFN as amortized Bayesian inference. What is the task prior, what is the context, what is predicted, and where can prior mismatch enter?
8. Design a fair experiment comparing a pretrained TFM with CatBoost across 20 datasets. Include data splits, hyperparameter budgets, ensembling, metrics, uncertainty, compute accounting, and statistical comparison.
9. A TFM wins average rank but loses badly on three business-critical datasets and is poorly calibrated. What additional evidence is needed before deployment?
10. Write pseudocode for a leakage-safe nested evaluation pipeline that includes imputation, categorical processing, tuning, probability calibration, and final testing.

## Evidence log

Maintain one row per assessed artifact:

| Date | Artifact | Score | Main error | Corrective action | Re-test result |
|---|---|---:|---|---|---|
| | | | | | |

The error log matters more than a streak of easy high scores. Repeated conceptual errors trigger focused remediation; unexplained performance claims trigger a full experimental audit.
