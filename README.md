# 💰 GE Flip - OSRS Economy Tools

A comprehensive web application for Old School RuneScape (OSRS) players to find profitable flipping opportunities and calculate high alchemy profits using real-time Grand Exchange data.

**Live Site:** [https://geflip.com](https://geflip.com)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Data Source](#-data-source)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🔍 Flipping Finder

The main feature of GE Flip is the **Flipping Finder**, a powerful tool for discovering profitable Grand Exchange flipping opportunities:

- **Real-time Price Data**: Live buy/sell prices from the RuneScape Wiki API
- **Comprehensive Item Table**: View all tradeable items with detailed metrics
- **Advanced Filtering System**:
  - **Simple Mode**: User-friendly interface for creating filters with dropdowns
  - **Advanced Mode**: Expression-based filtering with full control
  - **Preset Filters**: Pre-configured filters like "Favorites Only", "F2P Only", "High ROI (>5%)"
  - **Custom Filters**: Create, save, and manage your own filter combinations
  - **Filter Categories**: Organize filters into custom categories
  - **Live Preview**: Test filters before saving
- **Customizable Columns**:
  - Toggle visibility of 20+ preset columns
  - Create custom columns using mathematical expressions
  - Reorder columns via drag-and-drop
  - **Smart Action Column**: Automatically shows when filters trigger specific actions
  - Column groups: Core, Profit, Volume, Averages, Alchemy
- **Key Metrics**:
  - ROI % (Return on Investment)
  - Margin (profit per item after 1% GE tax)
  - Potential Profit (margin × buy limit)
  - Daily Volume
  - Margin × Volume (estimated daily profit potential)
  - Buy/Sell prices with timestamps
  - Buy limits (4-hour GE restrictions)
- **Favorites System**: Mark items as favorites for quick access
- **Sorting**: Click any column header to sort
- **Pagination**: Navigate through thousands of items efficiently
- **Auto-refresh**: Data updates automatically every 5 minutes

### 🧙 Alchemy Calculator

Calculate high alchemy profits to find the best items to alch:

- **Profit Calculations**: Automatic calculation of alch profit (High Alch Value - Nature Rune Cost - Item Cost)
- **Profit/Hr Estimates**: Estimated GP/hour based on 1,200 alchs per hour
- **Custom Nature Rune Cost**: Adjust nature rune price to match current market
- **Item Search**: Quickly find specific items to check alch profitability
- **Sortable Table**: Sort by profit, profit/hr, or any other metric
- **Real-time GE Prices**: Uses current Grand Exchange prices for accurate calculations

### 📊 Item Detail Pages

Click any item to view its dedicated page with:

- **Price History Charts**: Interactive time-series graphs showing price trends
- **Multiple Timeframes**: View 5-minute, 1-hour, 6-hour, and 24-hour data
- **Volume Data**: See trading volume over time
- **Item Information**: Full item details including examine text, members status, and more
- **Quick Actions**: Favorite items directly from the detail page

### 🆕 New Features

- **Changelog**: Stay updated with the latest changes via the `/changelog` page
- **Help Center**: Learn about presets and advanced expressions on the `/help` page
- **Mobile Optimized**: Improved mobile experience with responsive menus and tables

### 🎨 User Experience

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark color scheme with OSRS-inspired aesthetics
- **Persistent Settings**: All preferences saved to browser localStorage
  - Column visibility and order
  - Custom filters
  - Favorites
  - UI state (open/closed panels)
- **Fast Performance**: Optimized with React 19, Zustand state management, and Next.js 16
- **SEO Optimized**: Pre-rendered static pages for all items
- **Keyboard Accessible**: Full keyboard navigation support

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler for optimization
- **TypeScript** - Type-safe development

### State Management
- **Zustand** - Lightweight state management with persistence
  - `useItemsStore` - Flipping data and auto-refresh
  - `useFiltersStore` - Saved filters and presets
  - `useColumnsStore` - Column visibility and custom columns
  - `useFavoritesStore` - Favorite items
  - `useTimeseriesStore` - Historical price data
  - `useUIStore` - UI state (panels, modals)
  - `useMappingsStore` - Item metadata cache

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **SCSS Modules** - Component-scoped styles
- **CSS Variables** - Theme colors and design tokens
- **Google Fonts** - Cinzel (headings) and Inter (body)

### Data & Charts
- **Chart.js** - Interactive price charts
- **react-chartjs-2** - React wrapper for Chart.js
- **date-fns** - Date formatting and manipulation

### Filtering & Expressions
- **expr-eval** - Mathematical expression evaluation for custom columns
- **json-logic-js** - Advanced filter logic engine

### Icons
- **lucide-react** - Modern icon library

### Build & Deploy
- **GitHub Actions** - Automated CI/CD
- **GitHub Pages** - Static site hosting
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/scottsdevelopment/geflip.com.git
   cd geflip.com
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (static export)
- `npm start` - Start production server (not used for static export)
- `npm run lint` - Run ESLint

## 📖 Usage Guide

### Finding Profitable Flips

1. **Browse the main table** to see all items with their margins and ROI
2. **Sort by columns** like "Margin × Volume" to find high-volume profitable items
3. **Apply filters** to narrow down items:
   - Click "Filters" button
   - Use preset filters or create custom ones
   - Enable/disable filters with checkboxes
4. **Favorite items** by clicking the heart icon
5. **Click an item** to view detailed price history

### Creating Custom Filters

#### Simple Mode (Recommended for beginners)
1. Click "Filters" → "Simple" tab
2. Enter a filter name and optional category
3. Add conditions using dropdowns:
   - Select a field (e.g., "ROI %")
   - Choose an operator (e.g., ">")
   - Enter a value (e.g., "5")
4. Add multiple conditions with AND/OR logic
5. Click "Save Filter"

#### Advanced Mode (For power users)
1. Click "Filters" → "Advanced" tab
2. Write expressions using JavaScript-like syntax:
   ```javascript
   item.roi > 0.05 && item.volume > 1000
   ```
3. Available variables:
   - `item.*` - All item properties (name, low, high, roi, volume, etc.)
   - `now` - Current timestamp
4. Click "Save Filter"

### Customizing Columns

1. **Toggle columns**: Click "Columns" button and check/uncheck columns
2. **Reorder columns**: Drag column headers in the table
3. **Create custom columns**:
   - Click "Add Custom Column"
   - Enter name and expression (e.g., `item.high - item.low`)
   - Choose format (number, currency, percentage)
   - Click "Save"

### Using the Alchemy Calculator

1. Navigate to "More" → "Alchemy" in the navbar (Note: Currently hidden in main menu, accessible via direct link if enabled)
2. Adjust the Nature Rune Cost if needed (defaults to current GE price)
3. Search for specific items or browse the table
4. Sort by "Profit" or "Profit/Hr" to find the best alch items
5. Items with negative profit are not worth alching

## 📁 Project Structure

```
geflip.com/
├── .agent/                    # Agent workflows
│   └── workflows/
│       └── deploy.md         # Deployment instructions
├── .github/
│   └── workflows/
│       └── nextjs.yml        # GitHub Actions deployment
├── public/                    # Static assets
│   ├── banner.png            # OpenGraph banner
│   └── favico.ico            # Favicon
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── alchemy/          # Alchemy calculator page
│   │   ├── changelog/        # Changelog page
│   │   ├── help/             # Help & Documentation
│   │   ├── item/[slug]/      # Dynamic item detail pages
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── page.tsx          # Home page (Flipping Finder)
│   │   └── globals.css       # Global styles and CSS variables
│   ├── components/           # React components
│   │   ├── AlchemyCalculator.tsx
│   │   ├── ColumnBuilder.tsx
│   │   ├── ColumnToggle.tsx
│   │   ├── CustomColumnManager.tsx
│   │   ├── FilterBuilder.tsx
│   │   ├── FlippingFinder.tsx
│   │   ├── FlippingTable.tsx
│   │   ├── ItemCharts.tsx
│   │   ├── ItemDetails.tsx
│   │   ├── ItemSearch.tsx
│   │   ├── Navbar.tsx
│   │   ├── Pagination.tsx
│   │   ├── SavedFilterManager.tsx
│   │   ├── SimpleFilterBuilder.tsx
│   │   ├── TableRow.tsx
│   │   └── Tooltip.tsx
│   ├── lib/                  # Business logic and utilities
│   │   ├── api.ts            # API client for RuneScape Wiki
│   │   ├── slug.ts           # URL slug generation
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── columns/          # Column system
│   │   │   ├── engine.ts     # Expression evaluation
│   │   │   ├── presets.ts    # Default columns
│   │   │   ├── storage.ts    # LocalStorage persistence
│   │   │   └── types.ts
│   │   ├── constants/        # App constants
│   │   ├── favorites/        # Favorites logic
│   │   ├── filters/          # Filter system
│   │   │   ├── engine.ts     # Filter evaluation
│   │   │   ├── presets.ts    # Default filters
│   │   │   ├── storage.ts    # LocalStorage persistence
│   │   │   ├── translator.ts # Simple ↔ Advanced conversion
│   │   │   └── types.ts
│   │   ├── persistence/      # LocalStorage utilities
│   │   └── timeseries/       # Chart data processing
│   ├── stores/               # Zustand state stores
│   │   ├── useColumnsStore.ts
│   │   ├── useFavoritesStore.ts
│   │   ├── useFiltersStore.ts
│   │   ├── useItemsStore.ts
│   │   ├── useMappingsStore.ts
│   │   ├── useTimeseriesStore.ts
│   │   ├── useUIStore.ts
│   └── styles/               # Additional styles
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 📊 Data Source

All price data is provided by the [RuneScape Wiki Real-time Prices API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices):

- **Latest Prices**: `/api/v1/osrs/latest` - Current buy/sell prices
- **Item Mappings**: `/api/v1/osrs/mapping` - Item metadata (names, IDs, limits, alch values)
- **Time Series**: `/api/v1/osrs/timeseries` - Historical price data (5m, 1h, 6h, 24h)

The API is free to use and does not require authentication. Data is updated in real-time by the OSRS community.

### Data Refresh Strategy

- **Initial Load**: Fetches all data on page load
- **Auto-refresh**: Updates every 5 minutes (300,000ms)
- **Manual Refresh**: Click the refresh button in the navbar
- **Caching**: Item mappings are cached (they rarely change)
- **Static Export**: All item pages are pre-rendered for fast loading

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages.

### Automatic Deployment

Every push to the `main` branch triggers a GitHub Actions workflow that:
1. Builds the Next.js app as a static export
2. Generates static pages for all ~30,000 OSRS items
3. Deploys to GitHub Pages

### Manual Deployment

See the [deployment workflow](.agent/workflows/deploy.md) for detailed instructions.

To build locally:
```bash
npm run build
```

The static files will be output to the `out/` directory.

### Configuration

- **Base Path**: Set in `next.config.ts` to match your repository name
- **GitHub Pages**: Enabled in repository settings → Pages → Source: GitHub Actions
- **Domain**: Automatically deployed to `https://geflip.com`

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

### Feature Ideas
- Additional preset filters (e.g., "Low Risk Flips", "High Volume Items")
- More chart types (candlestick, volume bars)
- Export data to CSV
- Price alerts/notifications
- Flip history tracking
- Profit calculator with custom scenarios
- Mobile app version

### Bug Reports
If you find a bug, please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (especially filters and columns)
5. Commit with descriptive messages
6. Push to your fork
7. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Use Zustand for state management
- Keep components focused and reusable
- Add comments for complex logic
- Update documentation for new features

## 📝 License

This project is open source and available for personal and educational use. 

**Important**: This tool is not affiliated with or endorsed by Jagex Ltd. Old School RuneScape is a trademark of Jagex Ltd.

## 🙏 Acknowledgments

- **RuneScape Wiki** - For providing the free, real-time price API
- **OSRS Community** - For contributing price data
- **Jagex** - For creating Old School RuneScape

## 📧 Contact

- **GitHub**: [@scottsdevelopment](https://github.com/scottsdevelopment)
- **Website**: [https://geflip.com](https://geflip.com)

---

**Happy Flipping! 💰**
