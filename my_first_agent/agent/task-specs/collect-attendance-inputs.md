# Collect attendance inputs Task Specification

## Basic Information

- **Task ID:** T1
- **Task name:** Collect attendance inputs
- **Task type:** Retrieve
- **Task owner:** Hackathon organizer

## 1. Task Description

This task gathers the attendance-related information needed to plan the hackathon, including available registration information and the organizer’s event details. The workflow needs these inputs so the next task can organize them for the attendance forecast. The task follows a set collection rule: gather only the requested attendance and event-planning information and preserve it for analysis.

## 2. Inputs

### Input 1

- **Input name:** organizer_event_request
- **Contents and format:** The organizer’s request for an attendance forecast, including available registration information and basic event details in a form, document, spreadsheet, or message.
- **Source:** Trigger: Organizer requests attendance forecast.

- **If a required input is missing or invalid:** Record what information is missing and send the case to T4: Request organizer review.

## 3. Outputs

### Output 1

- **Output name:** raw_attendance_inputs
- **Contents and format:** A collected set of available registration information and event details, labeled with the source and any missing information.
- **Next task or recipient:** T2: Prepare analysis inputs.
- **Complete when:** The available attendance and event details have been collected and are ready for preparation.

## 4. Planned Tools

### Tool 1

- **Tool name:** `collect_attendance_inputs`
- **Input:** `organizer_event_request`
- **Output:** `raw_attendance_inputs`
- **Implementation Route:** File operations
- **Integration approach:** Direct integration
- **Role in this task:** Retrieve the organizer-provided registration information and event details, then organize the available material into collected attendance inputs without changing the original records.
- **Task timeout:** 45 seconds
- **Maximum retries:** 1
- **Retry only when:** A read-only file retrieval fails because of a temporary connection or file-access error. The retry only rereads the inputs and does not change any records.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the unavailable source or missing input and send the case to T4: Request organizer review.
