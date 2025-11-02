# 💰 OSRS Economy Tools

Free Old School RuneScape economy tools including a flipping finder with real-time Grand Exchange prices and an alchemy trade calculator.

## Features

### 🔄 Flipping Finder
- Real-time Grand Exchange price data from the RuneScape Wiki API
- Profit calculations with automatic 2% fee deduction
- ROI percentage calculations
- Sortable columns (profit, ROI, volume, etc.)
- F2P (Free-to-Play) filter option
- Minimum volume filter
- Search functionality
- 5-minute and 1-hour average price tracking
- High alchemy value and margin information

### ✨ Alchemy Calculator
- Calculate profits from high alchemy trades
- Auto-calculate optimal quantity based on starting capital
- Item lookup by name
- Auto-update starting capital after calculations
- Trade log for tracking multiple transactions
- Detailed breakdown of costs, profits, and ending capital

## Live Demo

Visit the live version: [https://scottsdevelopment.github.io/osrs-economy-tools/](https://scottsdevelopment.github.io/osrs-economy-tools/)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/scottsdevelopment/osrs-economy-tools.git
   cd osrs-economy-tools
   ```

2. Open `index.html` in a web browser or serve it with a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```

3. Navigate to `http://localhost:8000` (or your chosen port)

## Project Structure

```
osrs-flipper/
├── index.html      # Main HTML file
├── style.css       # Stylesheet
├── script.js       # Main JavaScript logic
├── favico.ico      # Favicon
└── banner.png      # Site banner image
```

## API Usage

This project uses the [RuneScape Wiki Real-time Prices API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices):
- Latest prices endpoint
- 5-minute and 1-hour average prices
- Item mapping data
- Volume data

## Technologies

- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Functionality
- **RuneScape Wiki API** - Price data

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is open source and available for free use.

## Acknowledgments

- Data provided by [RuneScape Wiki](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices)
- Built with 💖 using Cursor

