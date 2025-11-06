# UI Integration Dashboard

An interactive performance analysis dashboard for comparing UI integration test results across different time periods and CPU throttling scenarios.

## Features

- **Multiple Comparison Views**: Compare performance across Nov 2024, Jan 2025, Oct 2025, and Nov 2025
- **Throttling Scenarios**: Analyze both normal load and 6x CPU throttling conditions
- **Four Key Metrics**:
  - **TTRL** (Time to Request Loaded): How long until page loads and is usable
  - **TTSBI** (Time to Search Box Interaction): How long until search bar is ready
  - **TTRS** (Time to Results Shown): How long to get initial search results
  - **TTRR** (Time to Results Rendered): How long to get refined search results
- **Visual Analysis**: Side-by-side baseline vs current values with color-coded severity indicators
- **Organized Dropdown**: Sectioned comparison selector for easy navigation

## Tech Stack

- **Vite** - Fast build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **PapaParse** - CSV data parsing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` or `master` branch.

### Setup Instructions

1. **Enable GitHub Pages in your repository**:
   - Go to Settings → Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

2. **Push changes**: The workflow will automatically build and deploy your site

3. **Access your dashboard**: Visit `https://<username>.github.io/ui-integration-dashboard/`

### Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder contains your static site ready to deploy
```

## Data Structure

The dashboard reads CSV files from the `/data` directory with the following structure:

- `nov-2024-baseline.csv` - Baseline data from November 2024
- `jan-2025-v0_19_96.csv` - January 2025 data
- `oct-2025-v0_24_0.csv` - October 2025 data
- `nov-2025.csv` - November 2025 data

Each CSV includes columns for different metrics (TTRL, TTSBI, TTRS, TTRR) under both normal and 6x CPU throttling conditions.

## Performance Thresholds

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| TTRL | <3.5s | 3.5-5s | >5s |
| TTSBI | <1.7s | 1.7-3s | >3s |
| TTRS | <1.5s | 1.5-2.5s | >2.5s |
| TTRR | <1.2s | 1.2-2s | >2s |

## License

MIT
