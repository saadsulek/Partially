# Partially (`TerraCalc ∂/∂x`) — Visualizing Multivariable Calculus

An interactive multivariable calculus and vector calculus web laboratory designed for engineering students learning **Partial Differentiation**, **3D Slicing Planes**, **Step-by-Step Symbolic Derivatives**, **Clairaut's Theorem**, **Gradient Vectors ($\nabla f$)**, and **3D Vector Field Curl ($\nabla \times \vec{F}$)**.

---

## Core Modules

1. **🎬 20-Second Animated Concept Video (`Remotion`)**
   - Interactive `1920×1080` (`30fps`) 4-chapter explainer built with Remotion (`@remotion/player`) covering $\frac{\partial f}{\partial x}$ vs. $\frac{\partial f}{\partial y}$, 3D slicing planes $y = y_0$ and $x = x_0$, term-by-term differentiation rules, $\nabla f$, Clairaut's Theorem ($f_{xy} = f_{yx}$), and $3 \times 3$ Curl determinants.
2. **🧊 3D Surface & Slicing Plane Visualizer (`Three.js` WebGL)**
   - Plot any multivariable surface $z = f(x, y)$ in real time, toggle vertical slicing planes $y = y_0$ and $x = x_0$, and inspect tangent vectors $\vec{T}_x = \langle 1, 0, f_x \rangle$, $\vec{T}_y = \langle 0, 1, f_y \rangle$, and the linear Tangent Plane $z - z_0 = f_x(x - x_0) + f_y(y - y_0)$.
3. **🧮 Step-by-Step Symbolic Partial Derivative Solver (`mathjs` + `KaTeX`)**
   - Breaks down $\frac{\partial f}{\partial x}$, $\frac{\partial f}{\partial y}$, $\frac{\partial^2 f}{\partial x^2}$, $\frac{\partial^2 f}{\partial y^2}$, and $\frac{\partial^2 f}{\partial x \partial y}$ term-by-term with color-coded active variables (`#52b788` Spectral Mint) and frozen constants (`#e7c268` Luminous Gold).
4. **🌀 Vector Field Curl ($\nabla \times \vec{F}$) & Vorticity Paddlewheel**
   - Step-by-step $3 \times 3$ cross-product determinant expansion for $\vec{F}(x, y, z) = \langle P, Q, R \rangle$ paired with an interactive 2D spinning paddlewheel visualizer ($\omega_z = \frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}$).
5. **🧭 Clairaut's Theorem & 2D Gradient Contour Playground**
   - Symbolically and numerically verifies $f_{xy}(x_0, y_0) = f_{yx}(x_0, y_0)$ and maps level curves alongside the Gradient Vector $\nabla f = \langle f_x, f_y \rangle$ and Directional Derivative $D_{\hat{u}}f = \nabla f \cdot \hat{u}$.
6. **📝 Diagnostic Practice Quiz**
   - 5 progressive multivariable calculus exercises with instant verification, hints, and full KaTeX solutions.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev

# Build static production bundle (configured for GitHub Pages)
npm run build

# Render the 20s Concept Video to MP4
npm run remotion:render
```

---

## License

MIT License
