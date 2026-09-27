# Deliver forecast and recommendation Task Specification

## Basic Information

- **Task ID:** T6
- **Task name:** Deliver forecast and recommendation
- **Task type:** Act
- **Task owner:** Hackathon organizer

## 1. Task Description

This task formats and delivers the attendance forecast and planning recommendation to the Hackathon organizer. It includes the forecast range, key assumptions, uncertainty notes, and the recommended plan so the organizer can use it for event planning. The workflow is complete when the organizer receives the forecast and recommendation.

## 2. Inputs

### Input 1

- **Input name:** attendance_forecast
- **Contents and format:** An estimated attendance figure and forecast range, with assumptions and uncertainty notes.
- **Source:** T3: Estimate attendance.

### Input 2

- **Input name:** planning_recommendation
- **Contents and format:** A practical recommendation for staffing, capacity, check-in, supplies, and other event needs, including important tradeoffs and unresolved issues.
- **Source:** T5: Generate planning recommendation.

- **If a required input is missing or invalid:** Record which input is unavailable and hand the case to the Hackathon organizer. Do not mark the workflow as complete.

## 3. Outputs

### Output 1

- **Output name:** delivered_forecast_and_recommendation
- **Contents and format:** A formatted delivery containing the attendance forecast, planning recommendation, assumptions, uncertainty notes, and any unresolved issues.
- **Next task or recipient:** Hackathon organizer.
- **Complete when:** The delivery is available to the Hackathon organizer and the delivery status is recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** `deliver_forecast_and_recommendation`
- **Input:** `attendance_forecast` and `planning_recommendation`
- **Output:** `delivered_forecast_and_recommendation`
- **Implementation Route:** Web API calls
- **Integration approach:** Direct integration
- **Role in this task:** Format the forecast and recommendation and deliver the completed package to the Hackathon organizer while recording the delivery status.
- **Task timeout:** 45 seconds
- **Maximum retries:** 1
- **Retry only when:** The delivery system returns an explicit failure before accepting the delivery. Before retrying, check the delivery status or delivery ID so the package is not sent twice. If the outcome is uncertain, do not retry.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the delivery status and available evidence, then hand the case to the Hackathon organizer. Do not claim the forecast and recommendation were delivered.
