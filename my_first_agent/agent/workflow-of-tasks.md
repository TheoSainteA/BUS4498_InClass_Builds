# Workflow of Tasks



## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

The workflow begins when a CPVC organizer requests an attendance forecast for an upcoming hackathon using the current registration information and any available optional check-ins.

### 1.3 Completion Condition at Runtime

The workflow is complete when HackTrack delivers an attendance forecast and planning recommendation to the CPVC organizer for review.

### 1.4 General Workflow

HackTrack collects the current registration information and any available optional check-in information. It prepares the information for analysis, uses the previous event’s attendance rate as a starting point, and estimates how many registered students are likely to attend. The system then generates a planning recommendation to help CPVC organizers prepare appropriate amounts of food, drinks, and swag.

If the available information is incomplete or unclear, the system flags the issue for a CPVC organizer to review before completing the forecast. The organizer can review the forecast and recommendation before using them for event planning.

### 1.5 Workflow Diagram



```mermaid
flowchart TD
    S(["Trigger: Organizer requests attendance forecast"])
    T1["T1: Collect attendance inputs"]
    T2["T2: Prepare analysis inputs"]
    D1{"D1: Are inputs complete and clear?"}
    T3["T3: Estimate attendance"]
    T4["T4: Request organizer review"]
    T5["T5: Generate planning recommendation"]
    T6["T6: Deliver forecast and recommendation"]
    C1(["Completion: Organizer receives forecast and recommendation"])

    S --> T1 --> T2 --> D1
    D1 -->|Yes| T3
    D1 -->|No| T4
    T4 --> T2
    T3 --> T5 --> T6 --> C1
```
