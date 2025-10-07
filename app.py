import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import sympy as sp

# Set page configuration
st.set_page_config(page_title="MicroSim - Microeconomics Visualizer", layout="wide", page_icon="📊")

# Title and introduction
st.title("📊 MicroSim: Interactive Microeconomics Visualizer")
st.markdown("""
This app helps visualize fundamental microeconomic concepts including:
- **Cobb-Douglas Utility Function**: U(X,Y) = X^α · Y^(1-α)
- **Budget Constraint**: PX·X + PY·Y = I
- **Lagrange Method** for utility maximization
- **Marshallian Demand Functions**
""")

# Sidebar with parameter controls
st.sidebar.header("📐 Parameters")
st.sidebar.markdown("Adjust the sliders to see how parameters affect optimal consumption choices.")

# Parameter sliders
alpha = st.sidebar.slider(
    "α (Alpha - preference for good X)",
    min_value=0.1,
    max_value=0.9,
    value=0.5,
    step=0.05,
    help="The exponent on X in the Cobb-Douglas utility function. Higher values mean stronger preference for X."
)

income = st.sidebar.slider(
    "I (Income)",
    min_value=10.0,
    max_value=200.0,
    value=100.0,
    step=5.0,
    help="Total income available for consumption"
)

px = st.sidebar.slider(
    "PX (Price of good X)",
    min_value=0.5,
    max_value=10.0,
    value=2.0,
    step=0.5,
    help="Price per unit of good X"
)

py = st.sidebar.slider(
    "PY (Price of good Y)",
    min_value=0.5,
    max_value=10.0,
    value=2.0,
    step=0.5,
    help="Price per unit of good Y"
)

# Mathematical derivation section
st.header("📚 Mathematical Framework")

col1, col2 = st.columns(2)

with col1:
    st.subheader("1. Utility Function")
    st.latex(r"U(X, Y) = X^\alpha \cdot Y^{1-\alpha}")
    st.markdown(f"**Current form:** U(X, Y) = X^{{{alpha:.2f}}} · Y^{{{1-alpha:.2f}}}")
    
    st.subheader("2. Budget Constraint")
    st.latex(r"P_X \cdot X + P_Y \cdot Y = I")
    st.markdown(f"**Current form:** {px:.2f}X + {py:.2f}Y = {income:.2f}")

with col2:
    st.subheader("3. Marginal Rate of Substitution (MRS)")
    st.latex(r"MRS = -\frac{MU_X}{MU_Y} = -\frac{\alpha Y}{(1-\alpha) X}")
    st.markdown(f"**Current form:** MRS = -{alpha:.2f}Y / {1-alpha:.2f}X")
    
    st.subheader("4. Optimality Condition")
    st.latex(r"MRS = -\frac{P_X}{P_Y}")
    st.markdown(f"**Current form:** MRS = -{px:.2f}/{py:.2f} = {-px/py:.3f}")

# Lagrange method derivation
st.header("🎯 Lagrange Method Solution")

st.markdown("""
We solve the constrained optimization problem:
""")

st.latex(r"\max_{X,Y} \quad U(X, Y) = X^\alpha \cdot Y^{1-\alpha}")
st.latex(r"\text{subject to} \quad P_X \cdot X + P_Y \cdot Y = I")

st.markdown("**Step 1: Set up the Lagrangian**")
st.latex(r"\mathcal{L}(X, Y, \lambda) = X^\alpha \cdot Y^{1-\alpha} + \lambda(I - P_X \cdot X - P_Y \cdot Y)")

st.markdown("**Step 2: First-order conditions (FOCs)**")
col1, col2, col3 = st.columns(3)
with col1:
    st.latex(r"\frac{\partial \mathcal{L}}{\partial X} = \alpha X^{\alpha-1} Y^{1-\alpha} - \lambda P_X = 0")
with col2:
    st.latex(r"\frac{\partial \mathcal{L}}{\partial Y} = (1-\alpha) X^\alpha Y^{-\alpha} - \lambda P_Y = 0")
with col3:
    st.latex(r"\frac{\partial \mathcal{L}}{\partial \lambda} = I - P_X X - P_Y Y = 0")

st.markdown("**Step 3: Solve for optimal quantities (Marshallian demand)**")

# Calculate optimal quantities
x_star = (alpha * income) / px
y_star = ((1 - alpha) * income) / py

col1, col2 = st.columns(2)
with col1:
    st.latex(r"X^* = \frac{\alpha \cdot I}{P_X}")
    st.markdown(f"**X\\* = {alpha:.2f} × {income:.2f} / {px:.2f} = {x_star:.3f}**")

with col2:
    st.latex(r"Y^* = \frac{(1-\alpha) \cdot I}{P_Y}")
    st.markdown(f"**Y\\* = {1-alpha:.2f} × {income:.2f} / {py:.2f} = {y_star:.3f}**")

# Calculate utility at optimum
u_star = (x_star ** alpha) * (y_star ** (1 - alpha))
st.markdown(f"**Maximum Utility:** U(X\\*, Y\\*) = {u_star:.3f}")

# Verification of MRS = Price Ratio at optimum
mrs_at_optimum = -(alpha * y_star) / ((1 - alpha) * x_star)
price_ratio = -px / py
st.markdown(f"**Verification:** MRS at optimum = {mrs_at_optimum:.3f} ≈ Price Ratio = {price_ratio:.3f} ✓")

# Visualization section
st.header("📈 Interactive Visualization")

# Create the plot
fig, ax = plt.subplots(figsize=(12, 10))

# Set up the grid
x_max = min(income / px * 2, 150)
y_max = min(income / py * 2, 150)

x_range = np.linspace(0.1, x_max, 1000)

# Plot budget line
x_budget = np.linspace(0, income / px, 100)
y_budget = (income - px * x_budget) / py
ax.plot(x_budget, y_budget, 'r-', linewidth=2.5, label=f'Budget Line: {px:.1f}X + {py:.1f}Y = {income:.1f}')

# Plot indifference curves
utility_levels = [u_star * 0.5, u_star * 0.7, u_star * 0.85, u_star, u_star * 1.15]
colors = ['lightblue', 'skyblue', 'cornflowerblue', 'darkblue', 'gray']
linestyles = ['--', '--', '--', '-', ':']
linewidths = [1.5, 1.5, 1.5, 3, 1.5]

for i, u_level in enumerate(utility_levels):
    # Y = (U / X^α)^(1/(1-α))
    y_indiff = (u_level / (x_range ** alpha)) ** (1 / (1 - alpha))
    
    # Only plot valid portions
    valid_indices = (y_indiff > 0) & (y_indiff < y_max) & (x_range > 0)
    
    if i == 3:  # The optimal indifference curve
        ax.plot(x_range[valid_indices], y_indiff[valid_indices], 
                color=colors[i], linestyle=linestyles[i], linewidth=linewidths[i],
                label=f'Optimal Indifference Curve: U = {u_level:.2f}')
    else:
        ax.plot(x_range[valid_indices], y_indiff[valid_indices], 
                color=colors[i], linestyle=linestyles[i], linewidth=linewidths[i],
                alpha=0.6)

# Plot optimal point
ax.plot(x_star, y_star, 'ro', markersize=15, label=f'Optimal Bundle (X*={x_star:.2f}, Y*={y_star:.2f})',
        markeredgewidth=2, markeredgecolor='darkred')

# Add tangency illustration
# Draw tangent line at optimal point
slope_budget = -px / py
# Create a short tangent line segment
x_tangent = np.array([max(0, x_star - 5), min(x_max, x_star + 5)])
y_tangent = y_star + slope_budget * (x_tangent - x_star)
ax.plot(x_tangent, y_tangent, 'g--', linewidth=2, alpha=0.7, 
        label=f'Tangent (slope = MRS = {slope_budget:.3f})')

# Annotations
ax.annotate(f'Tangency Point\n(X*={x_star:.2f}, Y*={y_star:.2f})\nU*={u_star:.3f}',
            xy=(x_star, y_star), xytext=(x_star + 8, y_star + 8),
            fontsize=10, bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', alpha=0.7),
            arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0', color='black', lw=2))

# Formatting
ax.set_xlim(0, x_max)
ax.set_ylim(0, y_max)
ax.set_xlabel('Good X (quantity)', fontsize=12, fontweight='bold')
ax.set_ylabel('Good Y (quantity)', fontsize=12, fontweight='bold')
ax.set_title('Consumer Optimization: Indifference Curves & Budget Constraint', 
             fontsize=14, fontweight='bold', pad=20)
ax.legend(loc='upper right', fontsize=9, framealpha=0.9)
ax.grid(True, alpha=0.3, linestyle='--')
ax.set_aspect('equal', adjustable='box')

# Display the plot
st.pyplot(fig)

# Explanation section
st.header("💡 Live Explanation")

explanation_text = f"""
### Current Economic Situation:

**Consumer's Problem:**
- The consumer has an income of **${income:.2f}**
- Good X costs **${px:.2f}** per unit
- Good Y costs **${py:.2f}** per unit
- The consumer's preference parameter α = **{alpha:.2f}**, meaning they value good X with weight {alpha:.2f} and good Y with weight {1-alpha:.2f}

**Optimal Choice:**
- The consumer maximizes utility by purchasing **{x_star:.2f} units of X** and **{y_star:.2f} units of Y**
- This costs exactly: {px:.2f} × {x_star:.2f} + {py:.2f} × {y_star:.2f} = **${px*x_star + py*y_star:.2f}** (their entire budget)
- At this point, they achieve utility level **U = {u_star:.3f}**

**Why This Is Optimal:**
- At the optimal bundle, the **Marginal Rate of Substitution (MRS)** equals the **price ratio**
- MRS = {mrs_at_optimum:.3f} ≈ -PX/PY = {price_ratio:.3f}
- This means: the rate at which the consumer is willing to trade Y for X equals the market rate
- The indifference curve is **tangent** to the budget line at this point
- No other affordable bundle provides higher utility

**Marshallian Demand Interpretation:**
- Good X demand: X* = (α·I)/PX means demand for X is:
  - **Proportional** to income (as income doubles, X* doubles)
  - **Proportional** to preference α
  - **Inversely proportional** to its price (as PX doubles, X* halves)
  
- Good Y demand: Y* = ((1-α)·I)/PY follows similar logic

**Effects of Parameter Changes:**
"""

# Add specific insights based on current parameters
if alpha > 0.6:
    explanation_text += f"\n- 🔹 Since α = {alpha:.2f} > 0.5, the consumer has a **stronger preference for good X**, resulting in higher X* relative to Y*"
elif alpha < 0.4:
    explanation_text += f"\n- 🔹 Since α = {alpha:.2f} < 0.5, the consumer has a **stronger preference for good Y**, resulting in higher Y* relative to X*"
else:
    explanation_text += f"\n- 🔹 Since α ≈ 0.5, the consumer has **balanced preferences** between the two goods"

if px > py:
    explanation_text += f"\n- 🔹 Good X is **more expensive** (PX = {px:.2f} > PY = {py:.2f}), so the consumer buys relatively less X"
elif px < py:
    explanation_text += f"\n- 🔹 Good Y is **more expensive** (PY = {py:.2f} > PX = {px:.2f}), so the consumer buys relatively less Y"
else:
    explanation_text += f"\n- 🔹 Both goods have the **same price** (PX = PY = {px:.2f}), so choice depends purely on preferences (α)"

explanation_text += f"""

**Try This:**
- 🎯 Increase α to see the consumer buy more X and less Y (stronger preference for X)
- 💰 Increase income I to see the budget line shift outward (can afford more of both goods)
- 💲 Increase PX to see the budget line rotate inward on the X-axis (X becomes more expensive)
- 📊 Notice how the tangency point always moves to maintain MRS = PX/PY
"""

st.markdown(explanation_text)

# Additional educational section
with st.expander("📖 Learn More: Key Economic Concepts"):
    st.markdown("""
    ### Cobb-Douglas Utility Function
    The Cobb-Douglas function U(X,Y) = X^α · Y^(1-α) is widely used because:
    - It exhibits **diminishing marginal utility** (more of a good provides less additional satisfaction)
    - It has convenient mathematical properties for optimization
    - α represents the share of income spent on good X
    - It's homogeneous of degree 1 (constant returns to scale)
    
    ### Marginal Rate of Substitution (MRS)
    - MRS measures how much Y a consumer is willing to give up for one more unit of X
    - It's the negative slope of the indifference curve
    - MRS = -MUx/MUy (ratio of marginal utilities)
    - MRS diminishes as we move along an indifference curve (convexity)
    
    ### Lagrange Method
    - A mathematical technique for optimization with constraints
    - λ (lambda) is the Lagrange multiplier, representing the marginal utility of income
    - First-order conditions ensure no improvement is possible
    
    ### Marshallian Demand
    - Shows optimal quantity demanded as a function of prices and income: X*(PX, PY, I)
    - For Cobb-Douglas: X* = (α·I)/PX and Y* = ((1-α)·I)/PY
    - These are the solutions to the consumer's optimization problem
    - Note: Consumer spends exactly α·I on good X and (1-α)·I on good Y regardless of prices!
    """)

# Footer
st.markdown("---")
st.markdown("**MicroSim** - An interactive tool for learning microeconomic theory | Built with Streamlit")
