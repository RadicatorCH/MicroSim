# MicroSim

📊 **MicroSim** is an interactive Streamlit application that helps students visualize fundamental microeconomic concepts including the Lagrange method, Marshallian demand, indifference curves, and budget constraints.

## Features

- 🎯 **Interactive Visualization**: Real-time graphs showing indifference curves, budget lines, and optimal consumption bundles
- 📐 **Parameter Controls**: Adjust α (preference parameter), prices (PX, PY), and income (I) with intuitive sliders
- 📚 **Mathematical Derivations**: Step-by-step solutions using the Lagrange method
- 💡 **Live Explanations**: Dynamic explanations that update as you change parameters
- ✅ **Optimality Verification**: Visual and numerical confirmation that MRS = PX/PY at the tangency point
- 🤖 **AI Economics Assistant**: Chat with an AI tutor powered by OpenAI to ask questions and get parameter suggestions

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

### AI Chat Assistant

To enable the AI Economics Assistant feature:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

2. Configure the API key using one of these methods:

   **Option 1: Environment Variable**
   ```bash
   export OPENAI_API_KEY='your-api-key-here'
   streamlit run app.py
   ```

   **Option 2: Streamlit Secrets**
   Create `.streamlit/secrets.toml` in your project directory:
   ```toml
   OPENAI_API_KEY = "your-api-key-here"
   ```

3. The AI assistant can:
   - Answer questions about microeconomic concepts
   - Explain the current simulation state
   - Suggest parameter changes to explore different scenarios
   - Provide educational guidance on consumer theory

**Example questions:**
- "What happens if I increase my income?"
- "Why is the tangency point optimal?"
- "Show me a scenario where I prefer good Y more"
- "Explain the marginal rate of substitution"

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
- openai >= 1.0.0 (for AI chat assistant)
- python-dotenv >= 1.0.0 (for environment variable management)

## License

This project is open source and available for educational purposes.