---
title: "Air-in-Liquid Compound Drop Impact Simulation using Basilisk"
layout: post
author_profile: true
tags: [CFD, Basilisk, Air-in-liquid Compound Drop, AMR, Multiphase]
---

In this post, I share highlights from my first simulations on **air-in-liquid compound drop impacts** using the [Basilisk](http://basilisk.fr/) solver.  
The results reveal fascinating features such as **counter-jet formation**, fine **air-layer dynamics**, and **adaptive mesh refinement (AMR)** patterns.

---

### Simulation Details

- **Fluid**: Water  
- **Solver**: Basilisk (Volume-of-Fluid method)  
- **Setup**: Axisymmetric multiphase configuration  
- **Visualization**: Fluid fraction and AMR mesh snapshots  

---

### Bview Images Showing Counter Jet

| Fluid Fraction (Left) | Dynamic AMR Grid (Right) |
|-----------------------|--------------------------|
| ![Fluid Fraction](/images/drop-impact/Jet.png) | ![AMR Mesh](/images/drop-impact/Jet.png) |

- Left image: Blue represents air, red represents fluid (water).  
- Right image: AMR grid adapts dynamically near interfaces and curvature zones.

---

### Observations

- The **counter jet** forms after the primary impact and spreads along the axis.  
- The AMR mesh refines the interface with high fidelity, resolving small structures accurately.

Stay tuned for more detailed parametric studies and comparisons with experimental data.

---

Let me know if you'd like a downloadable video clip or an animated GIF in the next post.

