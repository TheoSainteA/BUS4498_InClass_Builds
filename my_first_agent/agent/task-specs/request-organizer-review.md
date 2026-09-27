# Request organizer review Task Specification

## Basic Information

- **Task ID:** T4
- **Task name:** Request organizer review
- **Task type:** Decide
- **Task owner:** Hackathon organizer

## 1. Task Description

This is a human-review task. The Hackathon organizer reviews the missing, conflicting, or unclear attendance and event information and provides the clarification needed for analysis. Human judgment is required because the organizer must confirm event details, priorities, and constraints that the system cannot assume. The workflow needs this response before the inputs can be prepared again.

## 2. Inputs

### Input 1

- **Input name:** input_completeness_status
- **Contents and format:** A `needs_review` status with a list of missing, conflicting, or unclear attendance and event details.
- **Source:** D1: Are inputs complete and clear?

- **If a required input is missing or invalid:** Record that a review request cannot be prepared and hand the case to the Hackathon organizer.

## 3. Outputs

### Output 1

- **Output name:** organizer_clarifications
- **Contents and format:** The organizer’s clarified or updated attendance and event details, provided as a message, form response, document, or spreadsheet update.
- **Next task or recipient:** T2: Prepare analysis inputs.
- **Complete when:** The organizer has provided a response or has explicitly identified which information remains unavailable.

## 4. Planned Tools

### Tool 1

- **Tool name:** `request_organizer_review`
- **Input:** `input_completeness_status`
- **Output:** `organizer_clarifications`
- **Implementation Route:** Not applicable — manual task.
- **Integration approach:** Not applicable — manual task.
- **Role in this task:** The Hackathon organizer manually reviews the listed issues and supplies clarifications. No software makes the organizer’s decisions.
- **Task timeout:** Human response deadline: one business day after the review request.
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable — manual task.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the organizer response is overdue and hand the unresolved case to the Hackathon organizer. A missed deadline does not count as approval or a completed response.
