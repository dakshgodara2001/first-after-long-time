from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

# In-memory storage (in production, use a database)
goals = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/goals', methods=['GET'])
def get_goals():
    """Get all financial goals"""
    return jsonify(goals)

@app.route('/api/goals', methods=['POST'])
def add_goal():
    """Add a new financial goal"""
    data = request.json
    
    goal = {
        'id': len(goals) + 1,
        'name': data.get('name'),
        'target_amount': float(data.get('target_amount', 0)),
        'current_savings': float(data.get('current_savings', 0)),
        'time_horizon_years': float(data.get('time_horizon_years', 0)),
        'expected_return_rate': float(data.get('expected_return_rate', 0)) / 100,  # Convert percentage to decimal
        'investment_frequency': data.get('investment_frequency', 'monthly')  # 'monthly' or 'one_time'
    }
    
    # Calculate investment requirements
    goal['calculations'] = calculate_investment(goal)
    
    goals.append(goal)
    return jsonify(goal), 201

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    """Delete a financial goal"""
    global goals
    goals = [g for g in goals if g['id'] != goal_id]
    return jsonify({'message': 'Goal deleted successfully'}), 200

@app.route('/api/goals/<int:goal_id>/calculate', methods=['POST'])
def recalculate_goal(goal_id):
    """Recalculate investment for a specific goal"""
    goal = next((g for g in goals if g['id'] == goal_id), None)
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.json
    # Update goal parameters
    if 'target_amount' in data:
        goal['target_amount'] = float(data['target_amount'])
    if 'current_savings' in data:
        goal['current_savings'] = float(data['current_savings'])
    if 'time_horizon_years' in data:
        goal['time_horizon_years'] = float(data['time_horizon_years'])
    if 'expected_return_rate' in data:
        goal['expected_return_rate'] = float(data['expected_return_rate']) / 100
    if 'investment_frequency' in data:
        goal['investment_frequency'] = data['investment_frequency']
    
    # Recalculate
    goal['calculations'] = calculate_investment(goal)
    return jsonify(goal)

def calculate_investment(goal):
    """
    Calculate investment requirements for a financial goal.
    
    Formulas:
    - Future Value of Current Savings: FV = PV * (1 + r)^n
    - For monthly investments: FV = PMT * [((1 + r)^n - 1) / r]
    - For one-time investment: FV = PV * (1 + r)^n
    
    Where:
    - PV = Present Value (current savings)
    - FV = Future Value (target amount)
    - r = monthly/annual return rate
    - n = number of periods
    - PMT = Payment per period
    """
    target = goal['target_amount']
    current = goal['current_savings']
    years = goal['time_horizon_years']
    annual_rate = goal['expected_return_rate']
    frequency = goal['investment_frequency']
    
    if years <= 0 or annual_rate < 0:
        return {
            'error': 'Invalid time horizon or return rate',
            'monthly_investment': 0,
            'one_time_investment': 0,
            'future_value_current': 0
        }
    
    # Calculate future value of current savings
    future_value_current = current * ((1 + annual_rate) ** years)
    
    # Amount needed from investments
    remaining_needed = target - future_value_current
    
    if remaining_needed <= 0:
        return {
            'monthly_investment': 0,
            'one_time_investment': 0,
            'future_value_current': round(future_value_current, 2),
            'remaining_needed': 0,
            'message': 'Current savings will exceed your goal!'
        }
    
    if frequency == 'monthly':
        # Monthly investment calculation
        monthly_rate = annual_rate / 12
        num_months = years * 12
        
        if monthly_rate == 0:
            # If no return, simple division
            monthly_investment = remaining_needed / num_months
        else:
            # Future Value of Annuity formula: FV = PMT * [((1 + r)^n - 1) / r]
            # Solving for PMT: PMT = FV * r / ((1 + r)^n - 1)
            monthly_investment = remaining_needed * monthly_rate / (((1 + monthly_rate) ** num_months) - 1)
        
        # One-time investment alternative
        one_time_investment = remaining_needed / ((1 + annual_rate) ** years)
        
        return {
            'monthly_investment': round(monthly_investment, 2),
            'one_time_investment': round(one_time_investment, 2),
            'future_value_current': round(future_value_current, 2),
            'remaining_needed': round(remaining_needed, 2),
            'total_monthly_investments': round(monthly_investment * num_months, 2)
        }
    
    else:  # one_time
        # One-time investment needed
        one_time_investment = remaining_needed / ((1 + annual_rate) ** years)
        
        # Monthly investment alternative (if they prefer)
        monthly_rate = annual_rate / 12
        num_months = years * 12
        if monthly_rate == 0:
            monthly_investment = remaining_needed / num_months
        else:
            monthly_investment = remaining_needed * monthly_rate / (((1 + monthly_rate) ** num_months) - 1)
        
        return {
            'one_time_investment': round(one_time_investment, 2),
            'monthly_investment': round(monthly_investment, 2),
            'future_value_current': round(future_value_current, 2),
            'remaining_needed': round(remaining_needed, 2),
            'total_monthly_investments': round(monthly_investment * num_months, 2)
        }

if __name__ == '__main__':
    app.run(debug=True, port=5000)

