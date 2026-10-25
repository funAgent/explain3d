# Scene specification

Write this before implementation, adapting fields to the subject:

```json
{
  "question": "What one relationship should become clear?",
  "audience": "curious general reader",
  "objects": [{"id":"input","meaning":"...","units":"..."}],
  "relationships": ["a computable constraint or event rule"],
  "parameters": [{"id":"length","units":"m","min":1,"max":2,"default":1.5}],
  "outputs": ["quantity calculated from the same state"],
  "durationSeconds": 10,
  "chapters": ["setup","input","relationship","inspection","result"],
  "simplifications": ["what is intentionally omitted"],
  "sources": ["authoritative source URL or provided source"],
  "acceptance": ["identity, lifecycle or visual criterion"],
  "untested": ["hardware/platform checks still outstanding"]
}
```

For mechanisms, state frame of reference and degrees of freedom. For optics, state ray approximation. For AI, label toy calculations and scripted events. For queues, state arrivals, service, capacity, blocking and rejected work.
