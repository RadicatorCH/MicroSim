# MicroSim

📊 **MicroSim** is an interactive Streamlit application that helps students visualize fundamental microeconomic concepts including the Lagrange method, Marshallian demand, indifference curves, and budget constraints.

## Features

- 🎯 **Interactive Visualization**: Real-time graphs showing indifference curves, budget lines, and optimal consumption bundles
- 📐 **Parameter Controls**: Adjust α (preference parameter), prices (PX, PY), and income (I) with intuitive sliders
- 📚 **Mathematical Derivations**: Step-by-step solutions using the Lagrange method
- 💡 **Live Explanations**: Dynamic explanations that update as you change parameters
- ✅ **Optimality Verification**: Visual and numerical confirmation that MRS = PX/PY at the tangency point

## Economic Concepts Covered

1. **Cobb-Douglas Utility Function**: U(X,Y) = X^α · Y^(1-α)
2. **Budget Constraint**: PX·X + PY·Y = I
3. **Marginal Rate of Substitution (MRS)**: -MUx/MUy
4. **Lagrange Method**: Constrained optimization technique
5. **Marshallian Demand Functions**: X* = (α·I)/PX and Y* = ((1-α)·I)/PY

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RadicatorCH/MicroSim.git
   cd MicroSim
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the Streamlit app:
```bash
streamlit run app.py
```

The app will open in your default web browser. Use the sidebar sliders to adjust:
- **α (Alpha)**: Preference for good X (0.1 to 0.9)
- **I (Income)**: Total income available (10 to 200)
- **PX**: Price of good X (0.5 to 10)
- **PY**: Price of good Y (0.5 to 10)

Watch how the graphs and calculations update in real-time!

## Educational Use

This tool is perfect for:
- Economics students learning consumer theory
- Instructors demonstrating optimization concepts
- Self-study of microeconomic principles
- Visualizing the effects of price and income changes

## Requirements

- Python 3.8 or higher
- streamlit >= 1.28.0
- numpy >= 1.24.0
- matplotlib >= 3.7.0
- sympy >= 1.12

## License

This project is open source and available for educational purposes.