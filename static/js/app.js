// API base URL
const API_BASE = '';

// Global state
let goalTypes = {};
let assets = [];

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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadGoalTypes();
    loadGoals();
    loadAssets();
    setupEventListeners();
    setupTabs();
    setupGoalTypeCards();
    initializePersonalizedView();
});

// Setup tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    const goalForm = document.getElementById('goalForm');
    goalForm.addEventListener('submit', addGoal);
    
    const assetForm = document.getElementById('assetForm');
    assetForm.addEventListener('submit', addAsset);
    
    // Goal type change handler
    const goalTypeSelect = document.getElementById('goalType');
    goalTypeSelect.addEventListener('change', handleGoalTypeChange);
    
    // SIP toggle
    const sipEnabled = document.getElementById('sipEnabled');
    sipEnabled.addEventListener('change', (e) => {
        document.getElementById('sipAmountGroup').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Loan toggle
    const loanEnabled = document.getElementById('loanEnabled');
    loanEnabled.addEventListener('change', (e) => {
        document.getElementById('loanOptionsGroup').style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked) {
            calculateEMI();
        }
    });
    
    // Loan calculation triggers
    ['loanAmount', 'loanInterestRate', 'loanTenure'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateEMI);
        }
    });
}

// Load goal types
async function loadGoalTypes() {
    try {
        const response = await fetch(`${API_BASE}/api/goal-types`);
        const data = await response.json();
        goalTypes = data.goal_types;
    } catch (error) {
        console.error('Error loading goal types:', error);
    }
}

// Handle goal type change
function handleGoalTypeChange() {
    const goalType = document.getElementById('goalType').value;
    const goalTypeConfig = goalTypes[goalType];
    
    if (!goalTypeConfig) return;
    
    // Update default values
    const timeHorizon = document.getElementById('timeHorizon');
    const returnRate = document.getElementById('returnRate');
    
    if (goalTypeConfig.default_tenure_years) {
        timeHorizon.value = goalTypeConfig.default_tenure_years;
    }
    if (goalTypeConfig.default_return_rate) {
        returnRate.value = goalTypeConfig.default_return_rate;
    }
    
    // Show/hide custom parameters
    const customParamsContainer = document.getElementById('customParamsContainer');
    customParamsContainer.innerHTML = '';
    
    if (goalTypeConfig.requires_custom_params) {
        customParamsContainer.innerHTML = generateCustomParams(goalType);
    }
}

// Generate custom parameters based on goal type
function generateCustomParams(goalType) {
    const params = {
        'retirement': `
            <h4>Retirement Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Current Age</label>
                    <input type="number" name="current_age" placeholder="30" min="18" max="100" value="30">
                </div>
                <div class="form-group">
                    <label>Retirement Age</label>
                    <input type="number" name="retirement_age" placeholder="60" min="40" max="80" value="60">
                </div>
                <div class="form-group">
                    <label>Monthly Expenses (Current)</label>
                    <input type="number" name="monthly_expenses" placeholder="50000" min="0" step="0.01" value="50000">
                </div>
                <div class="form-group">
                    <label>Inflation Rate (%)</label>
                    <input type="number" name="inflation_rate" placeholder="6" min="0" max="20" step="0.1" value="6">
                </div>
                <div class="form-group">
                    <label>Years in Retirement</label>
                    <input type="number" name="years_in_retirement" placeholder="20" min="5" max="40" value="20">
                </div>
            </div>
        `,
        'emergency': `
            <h4>Emergency Fund Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Monthly Expenses</label>
                    <input type="number" name="monthly_expenses" placeholder="50000" min="0" step="0.01" value="50000" required>
                </div>
                <div class="form-group">
                    <label>Months Coverage</label>
                    <input type="number" name="months_coverage" placeholder="6" min="3" max="24" value="6">
                </div>
            </div>
        `,
        'house': `
            <h4>House Goal Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Property Value ($)</label>
                    <input type="number" name="property_value" placeholder="500000" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Down Payment (%)</label>
                    <input type="number" name="down_payment_percent" placeholder="20" min="0" max="100" value="20">
                </div>
            </div>
        `,
        'car': `
            <h4>Car Goal Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Car Price ($)</label>
                    <input type="number" name="car_price" placeholder="30000" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Down Payment (%)</label>
                    <input type="number" name="down_payment_percent" placeholder="20" min="0" max="100" value="20">
                </div>
            </div>
        `,
        'education': `
            <h4>Education Goal Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Current Education Cost ($)</label>
                    <input type="number" name="current_cost" placeholder="50000" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Years to Goal</label>
                    <input type="number" name="years_to_goal" placeholder="15" min="1" max="30" value="15">
                </div>
                <div class="form-group">
                    <label>Education Inflation Rate (%)</label>
                    <input type="number" name="education_inflation_rate" placeholder="10" min="0" max="20" step="0.1" value="10">
                </div>
            </div>
        `,
        'marriage': `
            <h4>Marriage Goal Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Current Estimated Cost ($)</label>
                    <input type="number" name="current_cost" placeholder="100000" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Years to Goal</label>
                    <input type="number" name="years_to_goal" placeholder="5" min="1" max="30" value="5">
                </div>
                <div class="form-group">
                    <label>Inflation Rate (%)</label>
                    <input type="number" name="inflation_rate" placeholder="7" min="0" max="20" step="0.1" value="7">
                </div>
            </div>
        `,
        'child_education': `
            <h4>Child Education Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Current Education Cost ($)</label>
                    <input type="number" name="current_cost" placeholder="50000" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Years to Goal</label>
                    <input type="number" name="years_to_goal" placeholder="15" min="1" max="30" value="15">
                </div>
                <div class="form-group">
                    <label>Education Inflation Rate (%)</label>
                    <input type="number" name="education_inflation_rate" placeholder="10" min="0" max="20" step="0.1" value="10">
                </div>
            </div>
        `,
        'child_marriage': `
            <h4>Child Marriage Parameters</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label>Current Estimated Cost ($)</label>
                    <input type="number" name="current_cost" placeholder="100000" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Years to Goal</label>
                    <input type="number" name="years_to_goal" placeholder="20" min="1" max="30" value="20">
                </div>
                <div class="form-group">
                    <label>Inflation Rate (%)</label>
                    <input type="number" name="inflation_rate" placeholder="7" min="0" max="20" step="0.1" value="7">
                </div>
            </div>
        `,
        'build_wealth': `
            <h4>Build Wealth Parameters</h4>
            <div class="form-group">
                <label>Target Amount ($)</label>
                <input type="number" name="target_amount" placeholder="1000000" min="0" step="0.01" required>
            </div>
        `,
        'startup': `
            <h4>Start-up Parameters</h4>
            <div class="form-group">
                <label>Required Capital ($)</label>
                <input type="number" name="target_amount" placeholder="500000" min="0" step="0.01" required>
            </div>
        `,
        'custom': `
            <h4>Custom Goal Parameters</h4>
            <div class="form-group">
                <label>Target Amount ($)</label>
                <input type="number" name="target_amount" placeholder="Enter target amount" min="0" step="0.01" required>
            </div>
        `
    };
    
    return params[goalType] || params['custom'];
}

// Calculate EMI
function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('loanInterestRate').value) || 0;
    const tenure = parseFloat(document.getElementById('loanTenure').value) || 0;
    
    if (loanAmount <= 0 || tenure <= 0) {
        document.getElementById('emiDisplay').innerHTML = '';
        return;
    }
    
    const monthlyRate = (interestRate / 100) / 12;
    const numMonths = tenure * 12;
    
    let emi = 0;
    if (monthlyRate === 0) {
        emi = loanAmount / numMonths;
    } else {
        emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numMonths) / (Math.pow(1 + monthlyRate, numMonths) - 1);
    }
    
    document.getElementById('emiDisplay').innerHTML = `
        <strong>Estimated EMI:</strong> ${formatCurrency(emi)}/month
        <br><small>Total Interest: ${formatCurrency((emi * numMonths) - loanAmount)}</small>
    `;
}

// Load and display all goals
async function loadGoals() {
    try {
        const response = await fetch(`${API_BASE}/api/goals`);
        const goals = await response.json();
        displayGoals(goals);
        updateAssetsCheckboxList();
        updatePersonalizedView(goals, assets);
    } catch (error) {
        console.error('Error loading goals:', error);
    }
}

// Load assets
async function loadAssets() {
    try {
        const response = await fetch(`${API_BASE}/api/assets`);
        assets = await response.json();
        displayAssets();
        updateAssetsCheckboxList();
        // Reload goals to update personalized view
        const goalsResponse = await fetch(`${API_BASE}/api/goals`);
        const goals = await goalsResponse.json();
        updatePersonalizedView(goals, assets);
    } catch (error) {
        console.error('Error loading assets:', error);
    }
}

// Display assets
function displayAssets() {
    const assetsDisplay = document.getElementById('assetsDisplay');
    if (assets.length === 0) {
        assetsDisplay.innerHTML = '<p class="empty-state">No assets added yet.</p>';
        return;
    }
    
    assetsDisplay.innerHTML = assets.map(asset => `
        <div class="asset-item">
            <div class="asset-item-info">
                <div class="asset-item-name">${escapeHtml(asset.name)}</div>
                <div class="asset-item-details">
                    ${asset.type} • ${formatCurrency(asset.current_value)} • ${(asset.expected_return_rate * 100).toFixed(1)}% return
                </div>
            </div>
        </div>
    `).join('');
}

// Update assets checkbox list for goal linking
function updateAssetsCheckboxList() {
    const assetsList = document.getElementById('assetsList');
    if (assets.length === 0) {
        assetsList.innerHTML = '<p class="help-text">No assets available. Add assets in the Assets tab first.</p>';
        return;
    }
    
    assetsList.innerHTML = assets.map(asset => `
        <label>
            <input type="checkbox" name="linked_assets" value="${asset.id}">
            ${escapeHtml(asset.name)} (${formatCurrency(asset.current_value)})
        </label>
    `).join('');
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
    const goalTypeName = goalTypes[goal.goal_type]?.name || goal.goal_type;
    
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
    
    // SIP info
    let sipInfo = '';
    if (goal.sip_enabled && goal.sip_amount > 0) {
        sipInfo = `
            <div class="sip-info">
                💰 SIP: ${formatCurrency(goal.sip_amount)}/month → Future Value: ${formatCurrency(calc.sip_future_value || 0)}
            </div>
        `;
    }
    
    // Loan info
    let loanInfo = '';
    if (goal.loan_options && goal.loan_options.enabled && goal.loan_options.loan_amount > 0) {
        loanInfo = `
            <div class="loan-info">
                🏦 Loan: ${formatCurrency(goal.loan_options.loan_amount)} @ ${(goal.loan_options.interest_rate * 100).toFixed(1)}% 
                → EMI: ${formatCurrency(goal.loan_options.emi || 0)}/month
            </div>
        `;
    }
    
    // Linked assets info
    let linkedAssetsInfo = '';
    if (goal.linked_assets && goal.linked_assets.length > 0) {
        const linkedAssets = assets.filter(a => goal.linked_assets.includes(a.id));
        if (linkedAssets.length > 0) {
            linkedAssetsInfo = `
                <div class="linked-assets-info">
                    🔗 Linked Assets: ${linkedAssets.map(a => a.name).join(', ')} 
                    → Future Value: ${formatCurrency(calc.linked_assets_future_value || 0)}
                </div>
            `;
        }
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
                    <span class="goal-type-badge">${escapeHtml(goalTypeName)}</span>
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
            ${sipInfo}
            ${loanInfo}
            ${linkedAssetsInfo}
            <div class="calculations">
                <h3>📊 Investment Action Plan</h3>
                <div class="calculation-grid">
                    ${investmentDisplay}
                    <div class="calculation-item">
                        <div class="calculation-label">Future Value of Current Savings</div>
                        <div class="calculation-value">${formatCurrency(calc.future_value_current || 0)}</div>
                    </div>
                    ${calc.linked_assets_future_value > 0 ? `
                    <div class="calculation-item">
                        <div class="calculation-label">Linked Assets Future Value</div>
                        <div class="calculation-value">${formatCurrency(calc.linked_assets_future_value)}</div>
                    </div>
                    ` : ''}
                    ${calc.sip_future_value > 0 ? `
                    <div class="calculation-item">
                        <div class="calculation-label">SIP Future Value</div>
                        <div class="calculation-value">${formatCurrency(calc.sip_future_value)}</div>
                    </div>
                    ` : ''}
                    <div class="calculation-item">
                        <div class="calculation-label">Total Future Value (All Sources)</div>
                        <div class="calculation-value success">${formatCurrency(calc.total_future_value || 0)}</div>
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
    const goalType = formData.get('goal_type');
    
    // Collect custom parameters
    const customParams = {};
    const customInputs = event.target.querySelectorAll('[name^="current_age"], [name^="retirement_age"], [name^="monthly_expenses"], [name^="inflation_rate"], [name^="years_in_retirement"], [name^="months_coverage"], [name^="property_value"], [name^="down_payment_percent"], [name^="car_price"], [name^="current_cost"], [name^="years_to_goal"], [name^="education_inflation_rate"]');
    customInputs.forEach(input => {
        if (input.value) {
            customParams[input.name] = parseFloat(input.value) || input.value;
        }
    });
    
    // Collect linked assets
    const linkedAssets = [];
    formData.getAll('linked_assets').forEach(id => {
        linkedAssets.push(parseInt(id));
    });
    
    // Collect loan options
    const loanOptions = {};
    if (formData.get('loan_enabled') === 'on') {
        loanOptions.enabled = true;
        loanOptions.loan_amount = parseFloat(formData.get('loan_amount')) || 0;
        loanOptions.interest_rate = parseFloat(formData.get('loan_interest_rate')) || 0;
        loanOptions.tenure_years = parseFloat(formData.get('loan_tenure')) || 0;
        
        // Calculate EMI
        const monthlyRate = (loanOptions.interest_rate / 100) / 12;
        const numMonths = loanOptions.tenure_years * 12;
        if (monthlyRate === 0) {
            loanOptions.emi = loanOptions.loan_amount / numMonths;
        } else {
            loanOptions.emi = loanOptions.loan_amount * monthlyRate * Math.pow(1 + monthlyRate, numMonths) / (Math.pow(1 + monthlyRate, numMonths) - 1);
        }
    }
    
    const goalData = {
        goal_type: goalType,
        name: formData.get('name'),
        target_amount: formData.get('target_amount') ? parseFloat(formData.get('target_amount')) : null,
        current_savings: parseFloat(formData.get('current_savings')) || 0,
        time_horizon_years: parseFloat(formData.get('time_horizon_years')),
        expected_return_rate: formData.get('expected_return_rate') ? parseFloat(formData.get('expected_return_rate')) : null,
        investment_frequency: formData.get('investment_frequency'),
        custom_params: customParams,
        linked_assets: linkedAssets,
        loan_options: loanOptions,
        sip_enabled: formData.get('sip_enabled') === 'on',
        sip_amount: formData.get('sip_enabled') === 'on' ? parseFloat(formData.get('sip_amount')) || 0 : 0
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
            document.getElementById('customParamsContainer').innerHTML = '';
            document.getElementById('loanOptionsGroup').style.display = 'none';
            document.getElementById('sipAmountGroup').style.display = 'none';
            loadGoals();
            // Scroll to top to see the new goal in progress section
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Add a new asset
async function addAsset(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const assetData = {
        name: formData.get('name'),
        type: formData.get('type'),
        current_value: parseFloat(formData.get('current_value')),
        expected_return_rate: parseFloat(formData.get('expected_return_rate')) || 7
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assetData)
        });
        
        if (response.ok) {
            event.target.reset();
            loadAssets();
            updateAssetsCheckboxList();
        } else {
            const error = await response.json();
            alert('Error adding asset: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding asset:', error);
        alert('Error adding asset. Please try again.');
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

// Initialize personalized view based on user state
function initializePersonalizedView() {
    // This will be called after goals and assets are loaded
}

// Update personalized view based on current state
function updatePersonalizedView(goals, assets) {
    const coldUserState = document.getElementById('coldUserState');
    const assetsNoGoalsState = document.getElementById('assetsNoGoalsState');
    const goalsState = document.getElementById('goalsState');
    
    // Hide all states first
    coldUserState.style.display = 'none';
    assetsNoGoalsState.style.display = 'none';
    goalsState.style.display = 'none';
    
    if (goals.length > 0) {
        // User has goals - show progress
        goalsState.style.display = 'block';
        displayGoalsProgress(goals);
    } else if (assets.length > 0) {
        // User has assets but no goals
        assetsNoGoalsState.style.display = 'block';
        document.getElementById('assetsCount').textContent = assets.length;
    } else {
        // Cold user - no goals, no assets
        coldUserState.style.display = 'block';
    }
}

// Display circular progress bars for goals
function displayGoalsProgress(goals) {
    const container = document.getElementById('goalsProgressContainer');
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="empty-state">No goals to display</p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => createGoalProgressCard(goal)).join('');
}

// Create a goal progress card with circular progress
function createGoalProgressCard(goal) {
    const calc = goal.calculations || {};
    const progress = calculateGoalProgress(goal, calc);
    const progressAngle = (progress.percentage / 100) * 360;
    
    // Get goal icon based on goal type
    const goalIcon = getGoalIcon(goal.goal_type || 'custom');
    
    return `
        <div class="goal-progress-card">
            <div class="goal-progress-name">${escapeHtml(goal.name)}</div>
            <div class="circular-progress-wrapper">
                <div class="circular-progress" style="--progress-angle: ${progressAngle}deg;">
                    <div class="goal-progress-content">
                        <div class="goal-progress-icon">${goalIcon}</div>
                        <div class="goal-progress-percentage">${progress.percentage.toFixed(1)}%</div>
                        <div class="goal-progress-label">Complete</div>
                    </div>
                </div>
            </div>
            <div class="goal-progress-details">
                <span><strong>Target:</strong> ${formatCurrency(progress.targetValue)}</span>
                <span><strong>Saved:</strong> ${formatCurrency(progress.currentValue)}</span>
                <span><strong>Future Value:</strong> ${formatCurrency(progress.futureValue)}</span>
                <span><strong>Remaining:</strong> ${formatCurrency(Math.max(0, progress.targetValue - progress.futureValue))}</span>
                <span><strong>Time:</strong> ${goal.time_horizon_years} years</span>
            </div>
        </div>
    `;
}

// Calculate goal progress percentage
function calculateGoalProgress(goal, calc) {
    const target = goal.target_amount || 0;
    const currentSavings = goal.current_savings || 0;
    const futureValueCurrent = calc.future_value_current || 0;
    const linkedAssetsFV = calc.linked_assets_future_value || 0;
    const sipFV = calc.sip_future_value || 0;
    
    // Total future value from all sources (what current savings/assets will be worth at goal time)
    const totalFutureValue = futureValueCurrent + linkedAssetsFV + sipFV;
    
    // For progress, show how much of the goal is covered by current savings' future value
    // This gives a more accurate picture of progress towards the goal
    const progressValue = totalFutureValue > 0 ? totalFutureValue : futureValueCurrent;
    
    // Calculate percentage (cap at 100%)
    const percentage = target > 0 ? Math.min(100, (progressValue / target) * 100) : 0;
    
    return {
        percentage: percentage,
        currentValue: currentSavings, // Show current savings amount
        futureValue: progressValue, // Show future value for progress
        targetValue: target,
        totalFutureValue: totalFutureValue
    };
}

// Get icon for goal type
function getGoalIcon(goalType) {
    const icons = {
        'retirement': '🏖️',
        'early_retirement': '🌴',
        'build_wealth': '💎',
        'networth': '💎',
        'car': '🚗',
        'house': '🏠',
        'home': '🏠',
        'startup': '🚀',
        'education': '🎓',
        'marriage': '💍',
        'child_education': '🎓',
        'child_marriage': '💍',
        'emergency': '🛡️',
        'custom': '🎯'
    };
    return icons[goalType] || '🎯';
}

// Setup goal type card clicks
function setupGoalTypeCards() {
    const goalTypeCards = document.querySelectorAll('.goal-type-card');
    goalTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            const goalType = card.dataset.goalType;
            if (goalType) {
                // Switch to goals tab
                document.querySelector('.tab-btn[data-tab="goals"]').click();
                // Set the goal type in the form
                const goalTypeSelect = document.getElementById('goalType');
                if (goalTypeSelect) {
                    goalTypeSelect.value = goalType;
                    goalTypeSelect.dispatchEvent(new Event('change'));
                }
                // Scroll to form
                setTimeout(() => {
                    document.querySelector('.add-goal-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}
