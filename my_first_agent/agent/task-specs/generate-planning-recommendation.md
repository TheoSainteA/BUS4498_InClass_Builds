# Generate Planning Recommendation Task Specification

```yaml
# BASIC INFORMATION
task_id: "T5"
task_name: "Generate planning recommendation"
task_owner: "Hackathon organizer"
```

## 1. Task Goal

- **Objective:** Create a practical planning recommendation that helps the hackathon organizer use the attendance forecast to plan staffing, capacity, check-in, supplies, and other event needs.

## 2. Inbound Inputs

### Input 1

- **Input name:** `attendance_forecast`
- **Contents:** Estimated attendance, forecast range, assumptions, and uncertainty notes.
- **Source:** T3: Estimate attendance.

### Input 2

- **Input name:** `planning_inputs`
- **Contents:** Prepared event details and constraints, including schedule, venue capacity, available resources, and organizer priorities.
- **Source:** T2: Prepare analysis inputs.

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

### Permitted Subtask 1

- **Subtask name:** Interpret forecast
- **Subtask description:** Review the estimated attendance, range, assumptions, and uncertainty to identify the planning factors that matter most.
- **Subtask boundary:** May interpret the supplied forecast but may not change it or invent attendance data.
- **Retry limits:** One retry if a source-formatting issue can be corrected; otherwise hand off.

### Permitted Subtask 2

- **Subtask name:** Assess constraints
- **Subtask description:** Examine prepared event details and constraints to identify limitations or priorities that affect the recommendation.
- **Subtask boundary:** May use only the planning inputs provided and may not approve spending, change bookings, or commit resources.
- **Retry limits:** One retry if the input can be reread; otherwise hand off.

### Permitted Subtask 3

- **Subtask name:** Compare scenarios
- **Subtask description:** Consider useful planning scenarios and identify tradeoffs between attendance risk, capacity, staffing, check-in, and supplies.
- **Subtask boundary:** May create planning options but may not present a scenario as certain when the forecast is uncertain.
- **Retry limits:** One retry for a calculation or formatting failure; otherwise hand off.

### Permitted Subtask 4

- **Subtask name:** Draft recommendation
- **Subtask description:** Create a clear recommendation that explains the preferred plan, assumptions, important tradeoffs, and unresolved issues.
- **Subtask boundary:** May create a draft for the organizer but may not make final event decisions or send external communications.
- **Retry limits:** One retry for incomplete draft output; otherwise hand off.

Use intermediate findings to select the next permitted subtask. Do not follow a fixed sequence when the forecast, constraints, or unresolved issues show that a different permitted subtask or human review is needed.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** A planning recommendation is complete, grounded in the supplied forecast and planning inputs, and includes assumptions and uncertainty notes.
- **Hand off early when:** Required inputs are missing or conflicting, uncertainty is too high for a responsible recommendation, or a decision requires budget or resource approval.
- **Handoff recipient:** Hackathon organizer.

## 6. Outbound Deliverable

The agent provides the hackathon organizer with:

- A planning recommendation for staffing, capacity, check-in, supplies, or other relevant event needs.
- The attendance forecast and constraints used.
- Key assumptions, tradeoffs, and uncertainty notes.
- Any unresolved issue and a clear handoff note when human review is required.
