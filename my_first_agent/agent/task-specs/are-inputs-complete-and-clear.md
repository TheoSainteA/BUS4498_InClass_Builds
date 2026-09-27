# Are inputs complete and clear? Task Specification

## Basic Information

- **Task ID:** D1
- **Task name:** Are inputs complete and clear?
- **Task type:** Verify
- **Task owner:** Hackathon organizer

## 1. Task Description

This task checks whether the prepared attendance and event-planning information contains the required details and is clear enough to support an attendance estimate. It applies completeness criteria to identify missing, conflicting, or unclear information. The workflow needs this decision so complete inputs can move to forecasting and incomplete inputs can be returned to the organizer for review.

## 2. Inputs

### Input 1

- **Input name:** prepared_analysis_inputs
- **Contents and format:** A structured record of organized attendance and event details, including cleaned fields and flags for missing or unclear information.
- **Source:** T2: Prepare analysis inputs.

- **If a required input is missing or invalid:** Record that completeness cannot be assessed and send the case to T4: Request organizer review.

## 3. Outputs

### Output 1

- **Output name:** input_completeness_status
- **Contents and format:** A clear status of either `complete` or `needs_review`, with a short list of any missing, conflicting, or unclear details.
- **Next task or recipient:** T3: Estimate attendance when the status is `complete`; T4: Request organizer review when the status is `needs_review`.
- **Complete when:** The status and any supporting completeness findings are recorded and routed to the appropriate next task.

## 4. Planned Tools

### Tool 1

- **Tool name:** `check_input_completeness`
- **Input:** `prepared_analysis_inputs`
- **Output:** `input_completeness_status`
- **Implementation Route:** Functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Apply required-field and clarity checks to the prepared inputs and return a completeness status with any issues found.
- **Task timeout:** 45 seconds
- **Maximum retries:** 1
- **Retry only when:** A temporary validation or execution error occurs. The retry only checks the same prepared inputs and does not change any records.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that completeness could not be assessed and send the case to T4: Request organizer review.
