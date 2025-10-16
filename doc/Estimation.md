# Project Estimation

Date: 2025-04-09

Version: 1.0

# Estimation approach

Consider the GeoControl project as described in the swagger, assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch

# Estimate by size

###

|                                                                                                         | Estimate |
| ------------------------------------------------------------------------------------------------------- | -------- |
| NC = Estimated number of classes to be developed                                                        |     18     |
| A = Estimated average size per class, in LOC                                                            |     100     |
| S = Estimated size of project, in LOC (= NC \* A)                                                       |     1800     |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    |     180     |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     |     5.400€     |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |     1.2      |

# Estimate by product decomposition

###

| component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- |
| requirement document |                20                 |
| design document      |                25                 |
| code                 |                100                 |
| unit tests           |                40                 |
| api tests            |                30                 |
| management documents |                15                 |

# Estimate by activity decomposition

###

| Activity name | Estimated effort (person hours) |
| ------------- | ------------------------------- |
|       Requirements engineering        |                 20                |
|       Architectural design            |                 25                |
|       Implementation                  |                 100               |
|       Testing (unit + api)            |                 70                |
|       Documentation                   |                 20                |
|       Project management              |                 20                |
|       CI/CD                           |                 20                |

###

[![](https://img.plantuml.biz/plantuml/svg/bP8_JyCm4CNtIFaERok8WH8LiHQrImSaXDXGXbDoTGo9NUop4D-Um_qd9NHWoE3dUx_tR6SPXO8OSY8mnfJ5S_3lt0Yo7Y4Terf81x_54uMcGpMlxiiYagJGqZSeC9hUHsvLJ6uibSNRaJYG8yC3Ewc1dgBIxofyCNz4dNhXpsH3tevWPwnZ3jQP-Z2wE4q-QWihIao1UhGShN7riIzjXGCkqsQ_onQatw52vYfsC-pwR22nVWByCtG2EvTyvIYQXwlahE06jBFNO-OeSK8xNyvgSxjQd-pxol-dh7sJBXvm7p5nFq1VLCrBbVDVKXO_)](https://editor.plantuml.com/uml/bP8_JyCm4CNtIFaERok8WH8LiHQrImSaXDXGXbDoTGo9NUop4D-Um_qd9NHWoE3dUx_tR6SPXO8OSY8mnfJ5S_3lt0Yo7Y4Terf81x_54uMcGpMlxiiYagJGqZSeC9hUHsvLJ6uibSNRaJYG8yC3Ewc1dgBIxofyCNz4dNhXpsH3tevWPwnZ3jQP-Z2wE4q-QWihIao1UhGShN7riIzjXGCkqsQ_onQatw52vYfsC-pwR22nVWByCtG2EvTyvIYQXwlahE06jBFNO-OeSK8xNyvgSxjQd-pxol-dh7sJBXvm7p5nFq1VLCrBbVDVKXO_)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration |
| ---------------------------------- | ---------------- | ------------------ |
| estimate by size                   |         180         |      1.2        |
| estimate by product decomposition  |         230         |      1.4        |
| estimate by activity decomposition |         275         |      1.7        | 

# Discussion

The three estimation approaches yielded different results, both in terms of effort and duration. This variation is expected due to the nature and assumptions of each method:

- Estimate by Size tends to be more abstract and relies heavily on historical data and size metrics such as lines of code or function points. It may underestimate effort if complexities or integration challenges are not fully accounted for.

- Product Decomposition focuses on breaking the product into its components and estimating effort per component. It captures more detail than size-based estimation and often includes technical challenges specific to each module, leading to a slightly higher and potentially more realistic estimate.
- Activity Decomposition is the most detailed approach, as it involves identifying all tasks and activities (e.g., design, coding, testing, documentation). It tends to result in the highest estimate because it makes implicit effort (like coordination, reviews, and rework) explicit.
T
he increasing trend from size-based to activity-based estimation reflects a growing awareness of the actual work involved as the granularity increases. Each method serves different planning needs—early ballpark estimates versus detailed scheduling and resource allocation.
