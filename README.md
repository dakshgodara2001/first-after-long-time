# Financial Goal Planner 💰

A modern web application for financial goal planning that helps users calculate how much they need to invest to achieve their financial goals.

## Features

- ✨ **Add Multiple Financial Goals**: Create and manage multiple financial goals simultaneously
- 📊 **Smart Calculations**: Automatically calculates investment requirements based on:
  - Target amount
  - Current savings
  - Time horizon
  - Expected return rate
  - Investment frequency (monthly or one-time)
- 💡 **Actionable Insights**: Get clear recommendations on:
  - Monthly investment amount needed
  - One-time investment alternative
  - Future value of current savings
  - Remaining amount needed
- 🎨 **Modern UI**: Beautiful, responsive design that works on all devices
- 🗑️ **Easy Management**: Delete goals as needed

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/daksh.godara/Desktop/p1
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

3. **Start planning your financial goals!**

## How to Use

1. **Add a Goal:**
   - Enter the goal name (e.g., "Buy a House", "Retirement", "Vacation")
   - Set your target amount
   - Enter your current savings (if any)
   - Specify the time horizon in years
   - Set your expected annual return rate (e.g., 7% for moderate risk)
   - Choose investment frequency (monthly or one-time)

2. **View Calculations:**
   - The app automatically calculates how much you need to invest
   - See both monthly and one-time investment options
   - View the future value of your current savings

3. **Manage Goals:**
   - Add as many goals as you want
   - Delete goals when no longer needed

## Financial Calculations

The application uses standard financial formulas:

- **Future Value of Current Savings**: `FV = PV × (1 + r)^n`
- **Monthly Investment (Annuity)**: `PMT = FV × r / ((1 + r)^n - 1)`
- **One-Time Investment**: `PV = FV / (1 + r)^n`

Where:
- `PV` = Present Value
- `FV` = Future Value
- `r` = Return rate (annual or monthly)
- `n` = Number of periods
- `PMT` = Payment per period

## Project Structure

```
p1/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # Stylesheet
    └── js/
        └── app.js        # Frontend JavaScript
```

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Modern CSS with gradients and animations

## API Endpoints

- `GET /api/goals` - Get all financial goals
- `POST /api/goals` - Add a new financial goal
- `DELETE /api/goals/<id>` - Delete a financial goal
- `POST /api/goals/<id>/calculate` - Recalculate a goal (future enhancement)

## Example Use Cases

1. **Buying a House**: Target $500,000 in 10 years with 7% return
2. **Retirement**: Target $1,000,000 in 30 years with 8% return
3. **Vacation**: Target $10,000 in 2 years with 5% return
4. **Education**: Target $50,000 in 5 years with 6% return

## Notes

- The application uses in-memory storage. Goals will be lost when the server restarts.
- For production use, consider adding a database (SQLite, PostgreSQL, etc.)
- All calculations are estimates based on the provided return rates
- Past performance does not guarantee future results

## License

This project is open source and available for personal use.
