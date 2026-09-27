# Estimate attendance Task Specification

## Basic Information

- **Task ID:** T3
- **Task name:** Estimate attendance
- **Task type:** Reason
- **Task owner:** Hackathon organizer

## 1. Task Description

This task uses the complete prepared inputs to estimate expected hackathon attendance. It considers the available registration information, event details, assumptions, and uncertainty to create a forecast range rather than treating the estimate as certain. The workflow needs this forecast so T5 can create a planning recommendation for staffing, capacity, check-in, supplies, and other event needs.

## 2. Inputs

### Input 1

- **Input name:** prepared_analysis_inputs
- **Contents and format:** A structured record of organized attendance and event details, including cleaned fields and uncertainty notes.
- **Source:** T2: Prepare analysis inputs.

### Input 2

- **Input name:** input_completeness_status
- **Contents and format:** A status showing that the prepared inputs are complete, with any supporting completeness findings.
- **Source:** D1: Are inputs complete and clear?

- **If a required input is missing or invalid:** Record that attendance cannot be estimated and hand the case to the Hackathon organizer.

## 3. Outputs

### Output 1

- **Output name:** attendance_forecast
- **Contents and format:** An estimated attendance figure and forecast range, along with the assumptions and uncertainty notes used to create it.
- **Next task or recipient:** T5: Generate planning recommendation.
- **Complete when:** An attendance forecast with its range, assumptions, and uncertainty notes is available for planning.

## 4. Planned Tools

### Tool 1

- **Tool name:** `estimate_attendance`
- **Input:** `prepared_analysis_inputs` and `input_completeness_status`
- **Output:** `attendance_forecast`
- **Implementation Route:** Functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Use the prepared attendance and event information to calculate an attendance estimate and forecast range without changing source records.
- **Task timeout:** 60 seconds
- **Maximum retries:** 1
- **Retry only when:** A temporary calculation or execution error occurs. The retry recalculates from the same approved inputs and does not change any records.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the forecast was not produced and hand the available inputs to the Hackathon organizer. Do not continue to T5 as if a forecast exists.
