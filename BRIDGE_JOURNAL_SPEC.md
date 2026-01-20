# KAPTN BRIDGE JOURNAL
## 航行日志系统规范 (Ship's Log System Specification) v1.0

---

## 🎯 Naming & Philosophy

### Professional Terminology
- **英文:** Ship's Log / Bridge Journal / Navigation Log
- **中文:** 航行日志 / 舰桥日志 / 航迹记录
- **系统名称:** **BRIDGE JOURNAL**

### Why "Journal" in Maritime Context?

In maritime tradition, the **Ship's Log** (or **Journal**) is:
1. **Legal record** - Admissible in court
2. **Navigation record** - Every position, course change, weather
3. **Command record** - Every decision by the captain
4. **Audit trail** - Immutable, timestamped, witnessed

In accounting, **Journal Entry** means the same thing:
- First entry point of transactions
- Chronological record
- Immutable audit trail
- Source of truth

**KAPTN Bridge Journal = Ship's Log + Accounting Journal + Telemetry System**

---

## I. System Architecture (系统架构)

### Core Principles

```
BRIDGE JOURNAL 不是:
❌ 传统日志系统 (Log System)
❌ 分析平台 (Analytics Platform) 
❌ 错误追踪 (Error Tracking)

BRIDGE JOURNAL 是:
✅ 任务记录 (Mission Record)
✅ 决策轨迹 (Decision Trajectory)
✅ 信任证据 (Trust Evidence)
✅ 成长档案 (Growth Archive)
```

---

## II. Event Taxonomy (事件分类)

### Based on KAPTN Protocols

All events are classified by which protocol(s) they involve:

```
[PROTOCOL]_[DOMAIN]_[ACTION]_[OUTCOME]
```

### Event Categories by Protocol

#### 🔵 K Events (Knowledge Protocol)
观察、探测、问题生成

```
K_SIGNAL_DETECTED
K_UNKNOWN_REGISTERED  
K_INQUIRY_INITIATED
K_PATTERN_RECOGNIZED
K_ANOMALY_FLAGGED
```

#### 🟣 T Events (Thesis Protocol)  
模型构建、框架更新

```
T_MODEL_FORMED
T_HYPOTHESIS_LOCKED
T_THEORY_UPDATED
T_INTERPRETATION_REVISED
T_FRAMEWORK_EVOLVED
```

#### 🟠 P Events (Prioritize Protocol)
路径选择、优先级排序

```
P_PATH_SELECTED
P_PRIORITY_UPDATED
P_VECTOR_ELIMINATED
P_FOCUS_LOCKED
P_TRADE_OFF_RESOLVED
```

#### 🔴 A Events (Action Protocol)
执行、推进

```
A_COURSE_LOCKED
A_EXECUTION_INITIATED
A_MISSION_COMPLETED
A_ACTION_VALIDATED
A_CHECKPOINT_REACHED
```

#### 🟢 N Events (Navigation Protocol)
偏航检测、校准

```
N_DEVIATION_DETECTED
N_COURSE_CORRECTED
N_HEADING_RECALIBRATED  
N_TRAJECTORY_ADJUSTED
N_DRIFT_MONITORED
```

---

## III. Event Schema (事件模式)

### Base Event Structure

```typescript
interface BridgeJournalEvent {
  // === Identification ===
  event_id: string;              // UUID
  event_type: BridgeEventType;   // K_SIGNAL_DETECTED, etc.
  timestamp: string;             // ISO8601 with timezone
  
  // === Context (CRITICAL - Always Required) ===
  captain_id: string;            // User/Founder ID
  entity_id: string;             // Business entity ID
  session_id: string;            // Current session
  mission_id?: string;           // Optional mission grouping
  
  // === OAS Context (Trust System) ===
  oas_snapshot: {
    relationship_structure: number;  // 0-1
    action_style: number;            // 0-1
    context_interpretation: number;  // 0-1
    historical_state: number;        // 0-1
    intent_structure: number;        // 0-1
    composite_score: number;         // 0-1
  };
  
  // === Protocol Attribution ===
  primary_protocol: "K" | "T" | "P" | "A" | "N";
  secondary_protocols?: Array<"K" | "T" | "P" | "A" | "N">;
  
  // === Decision Context ===
  decision_dimension?: string;   // What was being decided
  confidence_proxy?: number;     // How certain (0-1)
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  
  // === Event Payload ===
  payload: Record<string, any>;  // Event-specific data
  
  // === Linkage (Traceability) ===
  parent_event_id?: string;      // If this follows another event
  related_event_ids?: string[];  // Related events
  business_event_id?: string;    // Link to BusinessEvent
  journal_entry_id?: string;     // Link to JournalEntry
  
  // === Metadata ===
  source: string;                // "onboarding", "compass", "ledger", etc.
  version: string;               // Schema version
  tags?: string[];               // Searchable tags
}
```

---

## IV. Critical Event Types

### A. Onboarding Events

```typescript
// Decision style calibration
K_SCENARIO_PRESENTED {
  scenario_id: "K" | "T" | "P" | "A" | "N",
  scenario_context: string,
  options_presented: Array<{id, label, pattern}>
}

K_OPTION_SELECTED {
  scenario_id: string,
  selected_option_id: string,
  selected_pattern: string,
  response_time_ms: number
}

// Oath ceremony
A_OATH_AFFIRMED {
  oath_text: string,
  affirmed_at: timestamp
}

// Waitlist registration  
K_SERVICE_INTEREST_DECLARED {
  services: string[],  // ["compass", "oracle", etc.]
  registration_data: {
    name: string,
    email: string,
    company?: string
  }
}

// Profile generation
T_PROFILE_GENERATED {
  decision_profile: DecisionProfile,
  generation_method: "onboarding_v1"
}
```

---

### B. COMPASS Events (AI Assistant)

```typescript
// Query & Response
K_QUERY_RECEIVED {
  query_text: string,
  query_intent: string,
  context_provided: object
}

T_RESPONSE_GENERATED {
  query_id: string,
  response_text: string,
  alternatives_count: number,
  explanation_included: boolean
}

// CFR (Counterfactual Reasoning)
T_ALTERNATIVES_EXPLORED {
  query_id: string,
  alternatives: Array<{
    alternative_id: string,
    description: string,
    confidence: number
  }>,
  mind_map_generated: boolean
}

P_ALTERNATIVE_SELECTED {
  query_id: string,
  alternative_id: string,
  selection_reason?: string
}
```

---

### C. GENESIS Events (Entity Formation)

```typescript
// Registration process
A_ENTITY_REGISTRATION_INITIATED {
  entity_type: string,
  jurisdiction: "CN" | string,
  business_info: object
}

P_FILING_STEP_COMPLETED {
  registration_id: string,
  step_name: string,
  documents_submitted: string[]
}

N_COMPLIANCE_CHECK_PERFORMED {
  registration_id: string,
  check_type: string,
  result: "PASS" | "WARN" | "BLOCK",
  issues: Array<{code, message}>
}

A_ENTITY_FORMED {
  entity_id: string,
  legal_name: string,
  registration_number: string,
  formation_date: date
}
```

---

### D. LEDGER Events (Bookkeeping)

```typescript
// Business event → Journal entry flow
K_BUSINESS_EVENT_CREATED {
  business_event_id: string,
  event_type: string,
  amount: number,
  description: string,
  evidence_refs: string[]
}

T_TEMPLATE_RECOMMENDED {
  business_event_id: string,
  recommended_templates: Array<{
    template_id: string,
    score: number,
    rationale: string
  }>
}

P_TEMPLATE_SELECTED {
  business_event_id: string,
  template_id: string,
  selection_method: "user" | "auto" | "copilot"
}

A_JOURNAL_ENTRY_DRAFTED {
  journal_entry_id: string,
  business_event_id: string,
  template_id: string,
  lines: Array<JournalLine>
}

N_VALIDATION_PERFORMED {
  journal_entry_id: string,
  gate_result: "PASS" | "WARN" | "BLOCK",
  issues: Array<{severity, code, message}>
}

A_JOURNAL_ENTRY_POSTED {
  journal_entry_id: string,
  posted_at: timestamp,
  acknowledgements?: string[]
}
```

---

### E. SHIELD Events (Tax Compliance)

```typescript
K_TAX_OBLIGATION_DETECTED {
  obligation_type: string,
  jurisdiction: string,
  deadline: date,
  estimated_amount?: number
}

T_DEDUCTION_OPPORTUNITY_IDENTIFIED {
  opportunity_id: string,
  deduction_type: string,
  estimated_savings: number,
  confidence: number
}

P_TAX_STRATEGY_SELECTED {
  filing_id: string,
  strategy_id: string,
  strategy_description: string,
  risk_level: "LOW" | "MEDIUM" | "HIGH"
}

A_TAX_FILING_SUBMITTED {
  filing_id: string,
  filing_type: string,
  submission_date: date,
  confirmation_number: string
}
```

---

### F. ORACLE Events (Analytics)

```typescript
K_DATA_SOURCE_CONNECTED {
  source_type: "ad_platform" | "crm" | "analytics",
  source_name: string,
  sync_frequency: string
}

T_INSIGHT_GENERATED {
  insight_id: string,
  insight_type: string,
  insight_text: string,
  confidence: number,
  data_sources: string[]
}

P_METRIC_THRESHOLD_EXCEEDED {
  metric_name: string,
  current_value: number,
  threshold_value: number,
  threshold_type: "above" | "below",
  severity: "info" | "warning" | "critical"
}

N_TREND_DETECTED {
  metric_name: string,
  trend_direction: "up" | "down" | "stable",
  trend_strength: number,
  period: string
}
```

---

## V. Trust System Events (信任系统事件)

### OAS (Ontological Alignment Score) Events

```typescript
// Trust building
T_OAS_UPDATED {
  previous_oas: OASSnapshot,
  current_oas: OASSnapshot,
  update_trigger: string,
  dimension_changes: Array<{
    dimension: string,
    previous: number,
    current: number,
    delta: number
  }>
}

// Trust fracture detection
N_TRUST_FRACTURE_DETECTED {
  fracture_type: "regret" | "override" | "skip",
  context: object,
  severity: "minor" | "moderate" | "severe",
  recovery_actions: string[]
}

// Trust recovery
A_TRUST_RECOVERY_INITIATED {
  fracture_event_id: string,
  recovery_strategy: string,
  actions_taken: string[]
}

// Intimacy growth
T_INTIMACY_MILESTONE_REACHED {
  milestone_type: string,
  intimacy_indicator: string,
  previous_level: number,
  current_level: number
}
```

---

## VI. System Integration Events

### Cross-Service Events

```typescript
// Service orchestration
K_SERVICE_REQUEST_RECEIVED {
  from_service: string,
  to_service: string,
  request_type: string,
  request_payload: object
}

A_SERVICE_RESPONSE_SENT {
  request_id: string,
  response_status: "success" | "error",
  response_payload: object,
  processing_time_ms: number
}

// Failure & recovery
N_FAILURE_MODE_TRIGGERED {
  failure_mode_id: string,
  failure_description: string,
  affected_services: string[],
  impact_level: "low" | "medium" | "high"
}

N_SYSTEM_RECOVERED {
  failure_mode_id: string,
  recovery_method: string,
  recovery_time_ms: number
}
```

---

## VII. Storage & Retrieval

### Database Schema

```sql
-- Main events table
CREATE TABLE bridge_journal_events (
  event_id UUID PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Context
  captain_id UUID NOT NULL,
  entity_id UUID NOT NULL,
  session_id UUID NOT NULL,
  mission_id UUID,
  
  -- OAS
  oas_snapshot JSONB NOT NULL,
  
  -- Protocol
  primary_protocol CHAR(1) NOT NULL CHECK (primary_protocol IN ('K','T','P','A','N')),
  secondary_protocols CHAR(1)[],
  
  -- Decision context
  decision_dimension VARCHAR(200),
  confidence_proxy DECIMAL(3,2),
  risk_level VARCHAR(20),
  
  -- Payload
  payload JSONB NOT NULL,
  
  -- Linkage
  parent_event_id UUID REFERENCES bridge_journal_events(event_id),
  related_event_ids UUID[],
  business_event_id UUID,
  journal_entry_id UUID,
  
  -- Metadata
  source VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  tags TEXT[],
  
  -- Indexes
  CONSTRAINT valid_confidence CHECK (confidence_proxy IS NULL OR (confidence_proxy >= 0 AND confidence_proxy <= 1))
);

-- Indexes for common queries
CREATE INDEX idx_events_captain_time ON bridge_journal_events(captain_id, timestamp DESC);
CREATE INDEX idx_events_entity_time ON bridge_journal_events(entity_id, timestamp DESC);
CREATE INDEX idx_events_type ON bridge_journal_events(event_type);
CREATE INDEX idx_events_protocol ON bridge_journal_events(primary_protocol);
CREATE INDEX idx_events_session ON bridge_journal_events(session_id);
CREATE INDEX idx_events_mission ON bridge_journal_events(mission_id) WHERE mission_id IS NOT NULL;
CREATE INDEX idx_events_parent ON bridge_journal_events(parent_event_id) WHERE parent_event_id IS NOT NULL;
CREATE INDEX idx_events_tags ON bridge_journal_events USING GIN(tags);
```

---

## VIII. API Design

### Core Endpoints

```typescript
// Write events (high throughput)
POST /api/journal/events
Body: BridgeJournalEvent

// Batch write
POST /api/journal/events/batch
Body: BridgeJournalEvent[]

// Query events
GET /api/journal/events?
  captain_id={uuid}
  &entity_id={uuid}
  &session_id={uuid}
  &mission_id={uuid}
  &protocol={K|T|P|A|N}
  &event_type={type}
  &from={timestamp}
  &to={timestamp}
  &limit={number}
  &offset={number}

// Get event chain (parent → children)
GET /api/journal/events/{event_id}/chain

// Get mission timeline
GET /api/journal/missions/{mission_id}/timeline

// Get OAS evolution
GET /api/journal/captains/{captain_id}/oas-history?
  from={timestamp}
  &to={timestamp}

// Get trust metrics
GET /api/journal/captains/{captain_id}/trust-metrics?
  period={day|week|month}
```

---

## IX. Telemetry Integration

### OpenTelemetry Compatibility

Bridge Journal events should be compatible with OpenTelemetry:

```typescript
// Convert to OTel Span
function toOTelSpan(event: BridgeJournalEvent): Span {
  return {
    traceId: event.session_id,
    spanId: event.event_id,
    parentSpanId: event.parent_event_id,
    name: event.event_type,
    startTime: event.timestamp,
    attributes: {
      "captain.id": event.captain_id,
      "entity.id": event.entity_id,
      "protocol.primary": event.primary_protocol,
      "oas.composite": event.oas_snapshot.composite_score,
      "confidence": event.confidence_proxy,
      "risk.level": event.risk_level,
      ...event.payload
    }
  };
}
```

---

## X. Usage Examples

### A. Onboarding Session Replay

```sql
-- Get complete onboarding journey
SELECT 
  event_type,
  timestamp,
  primary_protocol,
  payload->>'selected_pattern' as pattern,
  oas_snapshot->'composite_score' as oas
FROM bridge_journal_events
WHERE session_id = 'onboarding-session-123'
  AND source = 'onboarding'
ORDER BY timestamp;
```

### B. Trust Evolution Analysis

```sql
-- Track OAS changes over time
SELECT 
  date_trunc('day', timestamp) as day,
  AVG((oas_snapshot->>'composite_score')::decimal) as avg_oas,
  COUNT(*) FILTER (WHERE event_type LIKE 'N_TRUST_FRACTURE%') as fractures,
  COUNT(*) FILTER (WHERE event_type LIKE 'T_INTIMACY%') as intimacy_events
FROM bridge_journal_events
WHERE captain_id = 'captain-456'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

### C. Decision Pattern Mining

```sql
-- Analyze decision patterns by protocol
SELECT 
  primary_protocol,
  decision_dimension,
  COUNT(*) as frequency,
  AVG(confidence_proxy) as avg_confidence,
  AVG((oas_snapshot->>'composite_score')::decimal) as avg_oas
FROM bridge_journal_events
WHERE captain_id = 'captain-789'
  AND decision_dimension IS NOT NULL
  AND timestamp > NOW() - INTERVAL '90 days'
GROUP BY primary_protocol, decision_dimension
ORDER BY frequency DESC;
```

---

## XI. Privacy & Compliance

### Data Retention

```
- Onboarding events: Permanent (trust baseline)
- Operational events: 7 years (regulatory requirement)
- Sensitive PII: Encrypted at rest
- Right to erasure: Pseudonymization rather than deletion
```

### Access Control

```
- Captains: Full access to own journal
- Support: Read-only access with audit trail
- Analytics: Aggregated, anonymized only
- Export: GDPR-compliant data export
```

---

## XII. Monitoring & Alerting

### Key Metrics to Monitor

```
- Events per second (throughput)
- Event processing latency
- OAS calculation time
- Storage growth rate
- Query performance
- Trust fracture rate
- Missing OAS context (data quality)
```

---

## XIII. Migration Path

### From Current System

```
1. Deploy Bridge Journal service
2. Dual-write events (old + new)
3. Backfill historical events
4. Validate data consistency
5. Switch reads to new system
6. Deprecate old logging
```

---

## XIV. Future Extensions

### Planned Features

- Real-time event streaming (WebSocket)
- Event replay for debugging
- Mission branching (what-if scenarios)
- Collaborative missions (multi-captain)
- Event-driven workflows
- ML-based pattern recognition

---

## XV. Summary

**Bridge Journal 不是日志，是使命档案。**

It captures:
- ✅ Every signal detected (K)
- ✅ Every model formed (T)
- ✅ Every path chosen (P)
- ✅ Every action taken (A)
- ✅ Every course correction (N)

It enables:
- Trust measurement (OAS evolution)
- Decision archaeology (why did we do that?)
- Growth tracking (how have we evolved?)
- Failure learning (what went wrong?)
- Mission replay (complete audit trail)

**"The bridge journal is the black box of the Captain's journey through uncertainty."**

---

**航行日志是船长穿越不确定性的黑匣子。**
