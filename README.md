# Financial Goal Planner 💰

A comprehensive web application for financial goal planning that enables users to define, plan, and track all financial targets with automated calculations, loan options, asset linking, and SIPs (Systematic Investment Plans).

## Features

### 🎯 Goal Types with Smart Calculations

The application supports **11 predefined goal types** with intelligent default logic:

1. **Retirement** - Calculates retirement corpus based on current age, retirement age, monthly expenses, and inflation
2. **Emergency Fund** - Calculates emergency fund based on monthly expenses and coverage months (typically 6-12 months)
3. **Build Wealth** - Custom wealth building goals
4. **House Goal** - Calculates down payment needed based on property value
5. **Car Goal** - Calculates down payment needed based on car price
6. **Education Goal** - Calculates future education costs with inflation adjustment
7. **Marriage Goal** - Calculates future marriage costs with inflation
8. **Child Education** - Education planning for children with inflation
9. **Child Marriage** - Marriage planning for children with inflation
10. **Start-up Goal** - Capital requirements for start-ups
11. **Custom Goal** - Fully customizable goals

### 📊 Automated Calculations

Each goal type includes:
- **Default tenure** (time horizon) - Pre-filled based on goal type
- **Default return rate** - Optimized for each goal type
- **Automatic goal amount calculation** - Based on goal type logic and custom parameters
- **Investment requirements** - Monthly and one-time investment options

### 💰 Systematic Investment Plans (SIPs)

- Enable SIP for any goal
- Set monthly SIP amount
- Automatic calculation of SIP future value
- SIP contributions are factored into investment calculations

### 🏦 Loan Options

- Consider loan options for goals
- Calculate EMI (Equated Monthly Installment)
- Loan amount reduces target investment needed
- Support for custom interest rates and tenure
- Real-time EMI calculation

### 🔗 Asset Linking

- Link existing assets to goals
- Assets contribute to goal achievement
- Future value of linked assets calculated automatically
- Multiple assets can be linked to a single goal
- Asset types: Savings, Investment, Property, Stocks, Mutual Funds, Fixed Deposits, etc.

### 📈 Advanced Calculations

For every goal, the application calculates:
- **Monthly investment needed** (if monthly frequency selected)
- **One-time investment alternative**
- **Future value of current savings**
- **Future value of linked assets**
- **Future value of SIP contributions**
- **Total future value from all sources**
- **Remaining amount needed** (after accounting for savings, assets, SIPs, and loans)


## How to Use

### Adding a Financial Goal

1. **Select Goal Type**: Choose from 11 predefined goal types or create a custom goal
2. **Enter Goal Name**: Give your goal a descriptive name
3. **Fill Custom Parameters**: Based on the goal type, enter required parameters:
   - **Retirement**: Current age, retirement age, monthly expenses, inflation rate
   - **Emergency**: Monthly expenses, months of coverage
   - **House/Car**: Property/car price, down payment percentage
   - **Education/Marriage**: Current cost, years to goal, inflation rate
   - **Custom**: Target amount
4. **Target Amount**: Auto-calculated based on goal type, or enter manually
5. **Time Horizon**: Pre-filled based on goal type, can be customized
6. **Return Rate**: Pre-filled based on goal type, can be customized
7. **Current Savings**: Enter your current savings for this goal
8. **Investment Frequency**: Choose monthly or one-time

### Using SIP (Systematic Investment Plan)

1. Check "Enable SIP" checkbox
2. Enter monthly SIP amount
3. SIP contributions are automatically factored into calculations
4. View SIP future value in goal details

### Adding Loan Options

1. Check "Consider Loan Option" checkbox
2. Enter loan amount, interest rate, and tenure
3. EMI is calculated automatically
4. Loan amount reduces the target investment needed
5. View loan details in goal summary

### Linking Assets

1. **Add Assets First**: Go to the "Assets" tab
2. Enter asset details:
   - Asset name
   - Asset type (Savings, Investment, Property, etc.)
   - Current value
   - Expected return rate
3. **Link to Goals**: When creating/editing a goal, select assets to link
4. Linked assets' future values are automatically included in calculations

### Managing Assets

- Add multiple assets (savings accounts, investments, properties, etc.)
- Each asset has its own expected return rate
- Assets can be linked to multiple goals
- Future value of assets calculated based on goal timeline

## Financial Calculations

### Goal Amount Calculations

- **Retirement**: `Corpus = (Future Monthly Expenses × 12) × 25` (25x rule)
- **Emergency Fund**: `Amount = Monthly Expenses × Coverage Months`
- **House/Car**: `Down Payment = Price × Down Payment %`
- **Education/Marriage**: `Future Cost = Current Cost × (1 + Inflation)^Years`

### Investment Calculations

- **Future Value of Current Savings**: `FV = PV × (1 + r)^n`
- **Monthly Investment (Annuity)**: `PMT = FV × r / ((1 + r)^n - 1)`
- **One-Time Investment**: `PV = FV / (1 + r)^n`
- **SIP Future Value**: `FV = PMT × [((1 + r)^n - 1) / r]`
- **EMI Calculation**: `EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)`

Where:
- `PV` = Present Value
- `FV` = Future Value
- `r` = Return rate (annual or monthly)
- `n` = Number of periods
- `PMT` = Payment per period
- `P` = Principal (loan amount)

## Project Structure

```
p1/
├── app.py                 # Flask backend with goal types, calculations, loans, assets, SIPs
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template with tabs, forms, and goal display
└── static/
    ├── css/
    │   └── style.css     # Enhanced stylesheet with tabs, sections, and responsive design
    └── js/
        └── app.js        # Frontend JavaScript with goal types, assets, loans, SIPs
```

## API Endpoints

### Goals
- `GET /api/goals` - Get all financial goals
- `POST /api/goals` - Add a new financial goal
- `PUT /api/goals/<id>` - Update a financial goal
- `DELETE /api/goals/<id>` - Delete a financial goal

### Goal Types
- `GET /api/goal-types` - Get all available goal types with defaults

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Add a new asset

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Add a loan option

## Example Use Cases

### Retirement Planning
- Goal Type: Retirement
- Parameters: Age 30, Retire at 60, ₹50,000/month expenses, 6% inflation
- Result: Calculates retirement corpus needed (typically ₹2-5 crores)

### House Purchase
- Goal Type: House Goal
- Parameters: Property value ₹50 lakhs, 20% down payment
- Loan Option: ₹40 lakhs loan @ 8.5% for 20 years
- Result: Need ₹10 lakhs down payment, EMI calculated automatically

### Child Education
- Goal Type: Child Education
- Parameters: Current cost ₹5 lakhs, 15 years to goal, 10% education inflation
- SIP: ₹5,000/month
- Result: Future cost calculated, SIP contributions factored in

### Emergency Fund
- Goal Type: Emergency Fund
- Parameters: ₹50,000/month expenses, 6 months coverage
- Result: Need ₹3 lakhs emergency fund

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Modern CSS with gradients, tabs, and animations
- **Calculations**: Financial formulas for compound interest, annuities, EMI

## Notes

- The application uses in-memory storage. Goals and assets will be lost when the server restarts.
- For production use, consider adding a database (SQLite, PostgreSQL, etc.)
- All calculations are estimates based on the provided return rates and assumptions
- Past performance does not guarantee future results
- Loan calculations assume fixed interest rates
- Inflation rates are estimates and may vary

## License

This project is open source and available for personal use.
