// API base URL
const API_BASE = '';

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Load and display all goals
async function loadGoals() {
    try {
        const response = await fetch(`${API_BASE}/api/goals`);
        const goals = await response.json();
        displayGoals(goals);
    } catch (error) {
        console.error('Error loading goals:', error);
    }
}

// Display goals in the UI
function displayGoals(goals) {
    const goalsList = document.getElementById('goalsList');
    const emptyState = document.getElementById('emptyState');
    
    if (goals.length === 0) {
        emptyState.style.display = 'block';
        goalsList.innerHTML = '<p class="empty-state">No goals added yet. Add your first financial goal above!</p>';
        return;
    }
    
    emptyState.style.display = 'none';
    goalsList.innerHTML = goals.map(goal => createGoalCard(goal)).join('');
    
    // Add event listeners for delete buttons
    goals.forEach(goal => {
        const deleteBtn = document.getElementById(`delete-${goal.id}`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteGoal(goal.id));
        }
    });
}

// Create HTML for a goal card
function createGoalCard(goal) {
    const calc = goal.calculations || {};
    const frequency = goal.investment_frequency === 'monthly' ? 'Monthly' : 'One-Time';
    
    let investmentDisplay = '';
    if (goal.investment_frequency === 'monthly') {
        investmentDisplay = `
            <div class="calculation-item">
                <div class="calculation-label">Monthly Investment Needed</div>
                <div class="calculation-value">${formatCurrency(calc.monthly_investment || 0)}</div>
            </div>
            <div class="calculation-item">
                <div class="calculation-label">One-Time Alternative</div>
                <div class="calculation-value">${formatCurrency(calc.one_time_investment || 0)}</div>
            </div>
        `;
    } else {
        investmentDisplay = `
            <div class="calculation-item">
                <div class="calculation-label">One-Time Investment Needed</div>
                <div class="calculation-value">${formatCurrency(calc.one_time_investment || 0)}</div>
            </div>
            <div class="calculation-item">
                <div class="calculation-label">Monthly Alternative</div>
                <div class="calculation-value">${formatCurrency(calc.monthly_investment || 0)}</div>
            </div>
        `;
    }
    
    let messageHTML = '';
    if (calc.message) {
        const messageType = calc.message.includes('exceed') ? 'success' : 'error';
        messageHTML = `<div class="message ${messageType}">${calc.message}</div>`;
    }
    
    return `
        <div class="goal-card">
            <div class="goal-header">
                <div>
                    <div class="goal-title">${escapeHtml(goal.name)}</div>
                    <div class="goal-meta">
                        <span>🎯 Target: ${formatCurrency(goal.target_amount)}</span>
                        <span>💰 Current Savings: ${formatCurrency(goal.current_savings)}</span>
                        <span>⏱️ Time: ${goal.time_horizon_years} years</span>
                        <span>📈 Return Rate: ${(goal.expected_return_rate * 100).toFixed(1)}%</span>
                        <span>🔄 Frequency: ${frequency}</span>
                    </div>
                </div>
                <button class="btn btn-danger" id="delete-${goal.id}">Delete</button>
            </div>
            <div class="calculations">
                <h3>📊 Investment Action Plan</h3>
                <div class="calculation-grid">
                    ${investmentDisplay}
                    <div class="calculation-item">
                        <div class="calculation-label">Future Value of Current Savings</div>
                        <div class="calculation-value">${formatCurrency(calc.future_value_current || 0)}</div>
                    </div>
                    <div class="calculation-item">
                        <div class="calculation-label">Remaining Amount Needed</div>
                        <div class="calculation-value">${formatCurrency(calc.remaining_needed || 0)}</div>
                    </div>
                </div>
                ${messageHTML}
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add a new goal
async function addGoal(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const goalData = {
        name: formData.get('name'),
        target_amount: parseFloat(formData.get('target_amount')),
        current_savings: parseFloat(formData.get('current_savings')) || 0,
        time_horizon_years: parseFloat(formData.get('time_horizon_years')),
        expected_return_rate: parseFloat(formData.get('expected_return_rate')),
        investment_frequency: formData.get('investment_frequency')
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        });
        
        if (response.ok) {
            event.target.reset();
            loadGoals();
            // Scroll to the new goal
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        } else {
            const error = await response.json();
            alert('Error adding goal: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding goal:', error);
        alert('Error adding goal. Please try again.');
    }
}

// Delete a goal
async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/goals/${goalId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadGoals();
        } else {
            alert('Error deleting goal. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting goal. Please try again.');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const goalForm = document.getElementById('goalForm');
    goalForm.addEventListener('submit', addGoal);
    loadGoals();
});

