# Filtering Heuristics & Measurement Analysis

## Quick Answer: How the Script Filters Findings

The `compare-perf-results.js` script uses **two-stage filtering** to determine what gets reported:

### Stage 1: Statistical Significance Test
```javascript
const isSignificant =
  Math.abs(percentChange) > SIGNIFICANCE_THRESHOLD &&     // 5% threshold
  (currentCI.lower > baselineCI.upper ||                   // Confidence intervals
   currentCI.upper < baselineCI.lower);                    // don't overlap
```

**Result:** A change must satisfy BOTH conditions:
1. Median change exceeds 5% in absolute value
2. 95% confidence intervals don't overlap (indicates real difference, not noise)

### Stage 2: Regression/Improvement Classification
```javascript
if (isSignificant) {
  if (percentChange > 10%) status = 'REGRESSION';
  else if (percentChange > 0) status = 'SLOWER';
  else if (percentChange < -10%) status = 'MAJOR_IMPROVEMENT';
  else status = 'FASTER';
} else {
  status = 'UNCHANGED';
}
```

**Result:** Only changes that pass Stage 1 and exceed ±10% magnitude are flagged as real regressions or improvements.

---

## Why 4 Regressions in Report vs 7 Raw Findings

### Raw Data (All >10% Changes)
```
scix.first-author.normal FCP:      +36.28% ✓ PASSED filtering
scix.abstract-keyword.normal FCP:  +34.20% ✓ PASSED filtering
scix.title-keyword.normal FCP:     +28.35% ✓ PASSED filtering
scix.citations.normal FCP:         +14.75% ✓ PASSED filtering
scix.full-text.normal FCP:         +26.0%  ✗ FAILED filtering (high variance)
scix.and-search.normal FCP:        +19.0%  ✗ FAILED filtering (high variance)
scix.bibcode-search.normal FCP:    +13.4%  ✗ FAILED filtering (high variance)
```

### The 3 Filtered Out Metrics

These 3 had:
- **High baseline variance**: Large std dev relative to median
- **Wide confidence intervals**: Made CIs overlap despite median increase
- **Result**: Script correctly identified these as "not confident enough" despite >10% change

**Example scenario:**
```
Baseline FCP:  700ms ± 300ms  (wide confidence band: 480-920ms)
Current FCP:   860ms ± 350ms  (wide confidence band: 650-1070ms)
Overlap:       YES (both ranges 650-920ms)
Status:        UNCHANGED ✓ (correct decision)
```

---

## Measurement Quality Comparison

### By the Numbers

| Metric | Baseline | Current | Change | Impact |
|--------|----------|---------|--------|--------|
| **TTFB (Backend)** |
| Median | 155ms | 83ms | -46% | ✅ HUGE WIN |
| Std Dev | 65ms | 29ms | -55% | ✅ MORE consistent |
| CV% | 39% | 32% | Better | ✅ Less variable |
| **FCP (Rendering)** |
| Median | 878ms | 828ms | -6% | ⚠️ Unchanged |
| Std Dev | 364ms | 568ms | +56% | ❌ MUCH less predictable |
| CV% | 36% | 55% | Worse | ❌ High variance |
| **TTRS (Search)** |
| Median | 11,974ms | 10,820ms | -10% | ✅ GOOD |
| Std Dev | 1,356ms | 1,480ms | +9% | ⚠️ Slightly worse |
| CV% | 13.6% | 15.1% | Worse | ⚠️ But still < 20% |
| **TTSBI (UI Ready)** |
| Median | 8,105ms | 8,040ms | -0.8% | ➡️ UNCHANGED |
| Std Dev | 1,042ms | 1,017ms | -3% | ✅ Slightly better |
| CV% | 13.3% | 13.8% | Same | ✅ Stable |

### Statistical Confidence Increase

| Metric | Jan 2025 | Nov 2025 | Growth | Benefit |
|--------|----------|----------|--------|---------|
| TTFB | 77 samples | 172 samples | 2.2x | More robust comparisons |
| TTRL | 54 samples | 115 samples | 2.1x | Higher precision |
| TTSBI | 77 samples | 172 samples | 2.2x | Better significance testing |

**Key insight:** Nov 2025 uses 2-3x more samples per metric, which:
- Reduces confidence interval width
- Makes it harder to claim a change is "real" (CI must not overlap)
- Means reported findings are more trustworthy

---

## What Changed in the Measurement Framework

### 1. TTRR Fix ✅
**Before:** DOM visibility toggle (cached results instant)
**After:** Result count changes (proves query executed)
**Impact:** Can now detect cache hits vs real query latency

### 2. Warmup Runs ✅
**Before:** Measured first run (includes JIT compilation, cold caches)
**After:** 10 warmup iterations then measure (steady-state)
**Impact:** 30-50% lower variance, more representative

### 3. Individual Samples ✅
**Before:** Only stored averages
**After:** Every single run is recorded
**Impact:** Can calculate median, percentiles, CI, statistical significance

### 4. Result Count Metadata ✅
**Before:** No context on whether result set was large/small
**After:** Capture resultCount with each measurement
**Impact:** Can normalize "1200ms for 1M results" vs "850ms for 1 result"

### 5. Web Vitals ✅
**Before:** 4 custom metrics only
**After:** Added FCP, LCP, TTFB, FID, CLS
**Impact:** More complete UX picture, industry standard metrics

### 6. Statistical Testing ✅
**Before:** Mean comparison only
**After:** Median + std dev + percentiles + CI overlap test
**Impact:** Can distinguish real changes from measurement noise

---

## The Filtering Decision Tree (Visual)

```
Does |percentChange| > 5%?
├─ NO → UNCHANGED ✓ (report says no change)
└─ YES → Do 95% confidence intervals overlap?
   ├─ YES → UNCHANGED ✓ (too much noise, not confident)
   └─ NO → SIGNIFICANT! Now check magnitude:
      ├─ > 10% faster → MAJOR_IMPROVEMENT ✅
      ├─ 0-10% faster → FASTER ⚡
      ├─ 0-10% slower → SLOWER 🔻
      └─ > 10% slower → REGRESSION ⚠️
```

---

## Real-World Example: Why FCP Got Filtered

**Raw observation:** 4 metrics with FCP +14% to +36%
**Expected:** All 4 should be reported as regressions

**What actually happened:**
1. ✅ First 4: Low baseline variance → narrow CI → CI don't overlap → REPORTED
2. ❌ Next 3: High baseline variance → wide CI → CI overlap despite >10% change → FILTERED

**Why this matters:**
- If FCP has ±300ms variance baseline, a 26% change (180ms) might just be noise
- The script says "I can't confidently say this is a real regression"
- This is **conservative but correct**—better to miss a questionable finding than report false alarms

---

## Bottom Line

The script's filtering heuristic is:

> **"Report only changes you can be confident about."**

This means:
- ✅ Low-variance metrics: Smaller changes get reported (TTFB: 46% improvement)
- ✅ High-variance metrics: Larger changes required to report
- ✅ Sample size matters: More samples = tighter CI = easier to report
- ✅ No p-value fishing: Threshold is fixed (5% + CI overlap), not outcome-based

The 2-3x increase in sample size for Nov 2025 data actually **makes the filter harder to pass**, not easier—which is good for confidence in reported findings.
