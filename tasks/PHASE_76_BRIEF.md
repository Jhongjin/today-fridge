# Phase 76 Brief - Best Route Deviation Analytics

## Goal

Measure whether the best-route replay strip helps players follow prior successful paths or encourages new experiments.

## Changes

- Tracks the first divergence from a saved best route during replay.
- Adds expected and selected cell ids plus matched prefix length.
- Shows the event in the QA analytics panel.
- Documents the event in the analytics schema and competition loop.

## QA

- Browser coverage verifies `best_route_deviation` appears when a replay diverges from the saved best route.
