# Updated Comparison Report Analysis

## What Changed

### Report Summary Differences

| Metric | Original | Updated | Change |
|--------|----------|---------|--------|
| **Regressions** | 4 | 5 | +1 |
| **Major Improvements** | 33 | 31 | -2 |
| **Slightly Faster** | 18 | 22 | +4 |
| **Unchanged** | 39 | 37 | -2 |
| **New Tests** | 2 | 1 | -1 |

---

## The New Regression: scix.bibcode-search.normal FCP

### What Was Filtered Before

In the original report, this test had a **+23.88% FCP increase** but was **filtered out** as "not statistically significant."

**Why it was filtered:**
- Large baseline variance (CV% ~29%)
- Wide 95% confidence intervals
- Confidence intervals overlapped between baseline and current

### Why It Now Passes

The updated baseline data likely shows:
- **Slightly different median** for this test (578ms vs reported value)
- **Different variance profile**
- **Updated baseline data** might have tighter confidence intervals
- **Result:** CI overlap test now fails (intervals non-overlapping) → passes significance threshold

### Updated Regression Details

```
Test:       scix.bibcode-search.normal → FCP
Baseline:   578ms (σ: 178ms, CV: 29.1%, n: 68)
Current:    716ms (estimated)
Change:     +23.88%
Status:     ⚠️ REGRESSION (newly detected)
```

---

## The Reclassifications

### 2 Fewer "Major Improvements"

Two previously-reported major improvements were reclassified:
- Either moved to "Slightly Faster" status (5-10% improvement still reported as significant)
- Or moved to "Unchanged" (no longer passes significance test)

Likely causes:
- Updated baseline medians
- Changes in variance calculations
- Re-evaluation of confidence intervals

### 4 More "Slightly Faster"

Tests that now show 5-10% improvement (still statistically significant but below the -10% threshold for "major"):
- These are positive findings but not dramatic enough for "major improvement" status
- Still represent real, measurable improvements

---

## FCP Regression Pattern

### All 5 Regressions in FCP Metric

| Test | Baseline | Current | Change |
|------|----------|---------|--------|
| bibcode-search.normal | 578ms | 716ms | +23.88% |
| first-author.normal | 650ms | 894ms | +37.54% |
| citations.normal | 730ms | 856ms | +17.26% |
| title-keyword.normal | 652ms | 842ms | +29.14% |
| abstract-keyword.normal | 680ms | 926ms | +36.18% |

### Consistent Pattern

- **All in FCP (First Contentful Paint)**
- **Ranges from +17% to +37%**
- **Affects all query types**
- **Suggests rendering strategy change**

---

## What This Tells Us

### 1. The Filtering is Working

The system correctly identified one additional regression once the data was re-analyzed:
- It's not hidden or arbitrary
- The CI overlap test is the decisive factor
- Different baseline snapshots produce different CI widths

### 2. TTFB Improvements Still Stand

Backend response time improvements remain solid:
- **-45% average improvement**
- **Consistent across all conditions**
- **Lower variance** (more predictable)

### 3. FCP Problem is Real

Now **5 confirmed FCP regressions** (up from 4):
- Increased likelihood this is a real rendering issue
- Affects normal environment queries
- Different from 6x-CPU tests (which show improvement in FCP)

### 4. Sample Size and Confidence

Updated baseline has slightly more samples (68-96 per metric vs 54-77):
- Higher sample counts make CI tighter
- Tighter CI makes overlap test harder to pass
- Only the "strongest" signals pass significance

---

## Actionable Insights

### ✅ Keep Celebrating TTFB

Backend optimization is a clear win:
- -45% faster
- -56% more consistent
- Every test shows improvement

### ⚠️ Investigate FCP Regressions

Five confirmed FCP regressions warrant investigation:
- Look at rendering code changes since Jan 2025
- Check if different content is being prioritized
- Affects user's perceived "first paint"

### 📊 Trust the Statistical Filtering

The fact that bibcode-search.normal FCP now passes the filter suggests:
- Confidence intervals are meaningful
- The tool is being conservative (good)
- Additional data usually reveals hidden signals

---

## Methodology Note

These changes suggest the updated baseline data has:
- **Slightly different medians** for some tests
- **Updated variance profiles**
- **Possibly re-run with different environmental conditions**

The consistency of these changes (only 1 new regression, small number of reclassifications) suggests:
- The data collection process is stable
- Findings are reproducible
- The filtering heuristic is robust

No material change in the overall conclusion:
- **Backend: Major win**
- **Rendering: Problem area**
- **Everything else: Stable to improved**
