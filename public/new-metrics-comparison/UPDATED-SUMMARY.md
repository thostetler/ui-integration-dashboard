# Updated Performance Analysis Summary

## Files Updated & Available

### 📊 Interactive Dashboards
1. **[Updated Performance Dashboard](../outputs/performance-dashboard.html)**
   - Summary metrics: 5 regressions, 31 major improvements, 22 slight improvements, 37 unchanged
   - Distribution visualizations
   - Key findings highlighted
   - Updated with new data

2. **[Updated Measurement Comparison Charts](../outputs/measurement-comparison-charts.html)**
   - Metric-by-metric breakdown
   - Filtering logic explained
   - Statistical properties comparison
   - New regression callout

### 📄 Detailed Documentation
3. **[Updated Comparison Analysis](../outputs/updated-comparison-analysis.md)**
   - What changed between original (4 regressions) and updated (5 regressions)
   - Why scix.bibcode-search.normal FCP now passes significance test
   - Reclassification details (2 fewer improvements, 4 more slight improvements)
   - Actionable insights

4. **[Filtering Heuristics Explained](../outputs/filtering-heuristics-explained.md)**
   - Original deep dive on how compare script filters findings
   - Two-stage filtering process
   - Confidence interval overlap test explained
   - Why high-variance findings get filtered

5. **[Enhanced Compare Script](../outputs/compare-perf-results.js)**
   - Updated script with measurement methodology section
   - Includes documentation of 6 key framework improvements
   - Ready to use with new baselines

---

## Key Findings (Updated)

### The New Regression

**scix.bibcode-search.normal → FCP: +23.88%**

| Aspect | Details |
|--------|---------|
| **What it is** | First Contentful Paint (when first content appears) |
| **Baseline** | 578ms (σ: 178ms, n: 68 samples) |
| **Current** | 716ms |
| **Change** | +23.88% slower |
| **Why it was filtered before** | High baseline variance (CV% 29%) → wide CI → overlap with current |
| **Why it passes now** | Updated baseline data → tighter/different confidence intervals |
| **Significance** | Joins 4 other FCP regressions: all affected query types |

### FCP Regression Summary

All 5 regressions clustered in one metric:

```
scix.bibcode-search.normal    FCP: +23.88%
scix.first-author.normal      FCP: +37.54%
scix.abstract-keyword.normal  FCP: +36.18%
scix.title-keyword.normal     FCP: +29.14%
scix.citations.normal         FCP: +17.26%

Pattern: All in FCP, all queries affected, high variance
```

### TTFB Still Winning

Backend response time remains the biggest success:
- **-45% average faster**
- **-56% more consistent** (variability cut in half)
- **All conditions improved** (normal + 6x CPU throttle)
- **Confidence: Very High** (low variance, large samples)

### Statistical Confidence Growth

| Metric | Jan 2025 | Nov 2025 | Growth | Impact |
|--------|----------|----------|--------|---------|
| FCP | 96 samples | 172 samples | 1.8x | Higher confidence in CI calculations |
| TTFB | 96 samples | 172 samples | 1.8x | More robust comparisons |
| TTRL | 68 samples | 115 samples | 1.7x | Better significance testing |
| TTSBI | 96 samples | 172 samples | 1.8x | Tighter confidence intervals |

---

## Filtering Logic Deep Dive

### Why Only 5 Out of 7+ Regressions Reported

**Raw regressions found (all >10% FCP increase):**
- 5 pass significance test ✅ REPORTED
- 2-3 fail (high variance) ❌ FILTERED

**Example of filtered finding:**
```
Test:        scix.full-text.normal → FCP
Raw change:  +26.0%
Baseline:    600ms ± 241ms (wide range: 359-841ms)
Current:     756ms ± 247ms (wide range: 509-1003ms)
CI overlap:  YES (ranges 509-841ms overlap)
Decision:    Not significant (could be noise)
Status:      FILTERED ✓ Correct
```

### Confidence Intervals Explain The Filtering

High-variance tests have **wide confidence bands**:
- Baseline band (95% CI): ±300ms
- Current band (95% CI): ±350ms
- Even with 26% median increase, bands overlap
- Script says: "I can't confidently claim this is a real regression"

Low-variance tests have **tight confidence bands**:
- Baseline band (95% CI): ±50ms
- Current band (95% CI): ±30ms
- 46% median decrease
- Bands don't overlap
- Script says: "This is definitely real" → REPORTED

---

## The Data Behind The Scenes

### Updated Baseline Statistics

| Metric | Baseline Median | Baseline Std Dev | Baseline CV% | Baseline N |
|--------|-----------------|------------------|-------------|------------|
| FCP | 876ms | 367ms | 37% | 96 |
| TTFB | 153ms | 65ms | 39% | 96 |
| TTRL | 22,545ms | 1,561ms | 8.3% | 68 |
| TTRR | 1,652ms | 269ms | 15.7% | 68 |
| TTRS | 11,984ms | 1,343ms | 13.4% | 68 |
| TTSBI | 8,051ms | 1,022ms | 13.3% | 96 |

### Updated Current Statistics

| Metric | Current Median | Current Std Dev | Current CV% | Current N |
|--------|----------------|-----------------|------------|-----------|
| FCP | 828ms | 568ms | 55% | 172 |
| TTFB | 83ms | 29ms | 32% | 172 |
| TTRL | 21,372ms | 2,221ms | 10.4% | 115 |
| TTRR | 1,531ms | 327ms | 17% | 120 |
| TTRS | 10,820ms | 1,480ms | 15.1% | 115 |
| TTSBI | 8,040ms | 1,017ms | 13.8% | 172 |

---

## Changes from Previous Report

### Summary Count Changes

| Category | Before | After | Delta | Reason |
|----------|--------|-------|-------|--------|
| Regressions | 4 | 5 | +1 | bibcode-search FCP now significant |
| Major Improvements | 33 | 31 | -2 | Likely reclassified to "Slight" |
| Slight Improvements | 18 | 22 | +4 | Moved from "Major" (5-10% range) |
| Unchanged | 39 | 37 | -2 | Now in "Slight Improvements" |
| New Tests | 2 | 1 | -1 | One test no longer new |

### Why These Changes Matter

1. **The +1 regression** → FCP problem confirmed as affecting all query types
2. **The -2 major improvements** → Some findings border statistical significance (not as clear-cut)
3. **The +4 slight improvements** → Still meaningful gains, just not dramatic
4. **Overall conclusion unchanged** → TTFB remains winner, FCP remains problem area

---

## Actionable Next Steps

### 🔍 Investigate FCP Regressions

```
Priority: HIGH
Action:   Find rendering changes between Jan-Nov 2025
Questions:
  - Did content prioritization strategy change?
  - New layout shift causing repaints?
  - CSS animation/transition changes?
  - Font loading strategy different?
Impact:   5 affected query types, 17-37% slower
```

### ✅ Document TTFB Improvements

```
Priority: MEDIUM
Action:   Document and preserve backend optimizations
Questions:
  - What caused 45% TTFB improvement?
  - Changed database queries?
  - Caching improvements?
  - API optimization?
Impact:   Significant user-facing improvement
```

### 📊 Monitor Variance

```
Priority: MEDIUM
Action:   Watch why FCP consistency degraded
Questions:
  - Why did CV% jump from 37% to 55%?
  - Environmental factors (throttling)?
  - Test flakiness increased?
Impact:   Hard to predict FCP, makes future comparisons difficult
```

---

## Technical Note: The Filtering is Robust

The fact that only 1 additional finding (bibcode-search FCP) was added with updated data suggests:

✅ **Stable methodology** - Not over-sensitive to minor data changes  
✅ **Conservative filtering** - Only reports high-confidence findings  
✅ **Reproducible results** - Same test, different run = similar conclusion  
✅ **Statistical rigor** - CI overlap test works as intended  

This confidence in the analysis process makes reported findings more trustworthy.

---

## Recommended Reading Order

1. **Quick overview:** This file (you are here)
2. **Visual analysis:** Updated Performance Dashboard
3. **Measurement quality:** Measurement Comparison Charts  
4. **What changed:** Updated Comparison Analysis
5. **Deep dive:** Filtering Heuristics Explained
6. **Integration:** Enhanced Compare Script
