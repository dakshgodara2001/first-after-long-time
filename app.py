from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

# In-memory storage (in production, use a database)
goals = []
assets = []

@app.route('/')
def index():
    # Pass user state to template for personalization
    user_state = {
        'has_goals': len(goals) > 0,
        'has_assets': len(assets) > 0,
        'goals_count': len(goals),
        'assets_count': len(assets)
    }
    return render_template('index.html', user_state=user_state)

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
        'goal_type': data.get('goal_type', 'custom'),
        'name': data.get('name'),
        'target_amount': float(data.get('target_amount', 0)) if data.get('target_amount') else 0,
        'current_savings': float(data.get('current_savings', 0)),
        'time_horizon_years': float(data.get('time_horizon_years', 0)),
        'expected_return_rate': float(data.get('expected_return_rate', 0)) / 100 if data.get('expected_return_rate') else 0,  # Convert percentage to decimal
        'investment_frequency': data.get('investment_frequency', 'monthly'),  # 'monthly' or 'one_time'
        'custom_params': data.get('custom_params', {}),
        'linked_assets': data.get('linked_assets', []),
        'loan_options': data.get('loan_options', {}),
        'sip_enabled': data.get('sip_enabled', False),
        'sip_amount': float(data.get('sip_amount', 0)) if data.get('sip_amount') else 0
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

@app.route('/api/goal-types', methods=['GET'])
def get_goal_types():
    """Get all available goal types with default parameters"""
    goal_types = {
        'retirement': {
            'name': 'Retirement',
            'default_tenure_years': 30,
            'default_return_rate': 8,
            'requires_custom_params': True
        },
        'early_retirement': {
            'name': 'Early Retirement',
            'default_tenure_years': 20,
            'default_return_rate': 10,
            'requires_custom_params': True
        },
        'build_wealth': {
            'name': 'Build Wealth',
            'default_tenure_years': 15,
            'default_return_rate': 12,
            'requires_custom_params': False
        },
        'house': {
            'name': 'House Goal',
            'default_tenure_years': 10,
            'default_return_rate': 8,
            'requires_custom_params': True
        },
        'car': {
            'name': 'Car Goal',
            'default_tenure_years': 5,
            'default_return_rate': 7,
            'requires_custom_params': True
        },
        'startup': {
            'name': 'Startup Goal',
            'default_tenure_years': 5,
            'default_return_rate': 15,
            'requires_custom_params': False
        },
        'education': {
            'name': 'Education Goal',
            'default_tenure_years': 10,
            'default_return_rate': 10,
            'requires_custom_params': True
        },
        'emergency': {
            'name': 'Emergency Fund',
            'default_tenure_years': 1,
            'default_return_rate': 5,
            'requires_custom_params': True
        }
    }
    return jsonify({'goal_types': goal_types})

@app.route('/api/assets', methods=['GET'])
def get_assets():
    """Get all assets"""
    return jsonify(assets)

@app.route('/api/assets', methods=['POST'])
def add_asset():
    """Add a new asset"""
    data = request.json
    
    asset = {
        'id': len(assets) + 1,
        'name': data.get('name'),
        'type': data.get('type'),
        'current_value': float(data.get('current_value', 0)),
        'expected_return_rate': float(data.get('expected_return_rate', 7)) / 100  # Convert percentage to decimal
    }
    
    assets.append(asset)
    return jsonify(asset), 201

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
