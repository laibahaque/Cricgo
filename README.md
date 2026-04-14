# 🏏 3D Cricket Game with Performance Analysis (Three.js)

## 📌 Project Overview

This project is a **Semester Lab Assignment (HCI / Computer Graphics)** in which I tried to implement a **3D Cricket Game** using **HTML, CSS, JavaScript, and Three.js**.

*👉 Note: The 3D character models (batsman, bowler, etc.) used in this project are taken from Sketchfab and animated rigged models are imported from Mixamo for better realism and visual quality.

The main idea was to simulate a basic cricket environment where a **bowler delivers the ball** and the **batsman responds to hit it**. Along with gameplay, I also attempted to integrate **human performance analysis using Fitts’s Law** in a simplified way.

While the core features are implemented, some parts are handled in a simplified or indirect (hidden) way due to time and complexity constraints.

---

## 🎮 Gameplay Description

* The player clicks to start a ball delivery.
* The bowler throws the ball toward the batsman.
* The batsman moves left or right to align with the ball.
* The player attempts to hit the ball using timing.
* The game keeps track of:

  * Score (runs)
  * Ball outcomes (hit, miss, wicket)
  * Player movement behavior

---

## 🧠 Key Concepts Used

### 1. 📍 Position Interpolation (LERP)

LERP is used to smoothly move the batsman from one position to another.

* Formula used:

  position = (1 - t) × A + t × B

Where:

* **A** = starting position
* **B** = target position
* **t** = value between 0 and 1

This helps in creating smooth and controlled movement instead of instant jumps.

---

### 2. 🎯 Player Response Analysis (Fitts’s Law)

Instead of directly focusing on complex motor behavior, I implemented a simplified **Player Response Analysis** using Fitts’s Law.

* Formula used:

  ID = log₂(D / W + 1)

Where:

* **D** = distance moved by the batsman

* **W** = target width (kept constant)

* Efficiency is calculated as:

  Efficiency = Movement Time / ID

This gives an estimate of how efficiently the player reacts and moves during gameplay.

---

## ⚙️ Game Mechanics

### 🔹 Ball Physics

* The ball follows a predefined trajectory from bowler to batsman.
* Speed and bounce are approximated using basic physics logic.

### 🔹 Collision Detection

* Ball and bat collision detection is implemented.
* Ball and wicket collision is also handled to detect “out” conditions.

### 🔹 Scoring System

* 6 runs → big hit
* 4 runs → boundary
* Out → wicket hit

---

## 📊 Performance Tracking

For each ball, the following data is recorded:

* Movement Time
* Distance Covered
* Index of Difficulty (ID)
* Efficiency (MT / ID)
* Accuracy (hits vs total attempts)

At the end of the game, a **final summary popup** displays overall performance statistics.

---

## 🎁 Special Features

### 🎯 Ticker System (Live Feedback)
* The game includes a ticker system that shows real-time messages during gameplay.
* It provides instant feedback such as:
* Ball movement
* Batsman hit
* Score updates (4, 6 runs)
* This improves user experience by giving continuous interaction feedback.

### 🎲 Mystery Box

* A random reward system appears during gameplay to enhance user interaction.

### 📊 Final Analysis Popup

* Displays a complete performance summary after all balls are played.

### 🔄 Animations

* Basic real-time animations are implemented using Three.js.

---

## ⚠️ Limitations / Notes

* The 3D models (batsman, bowler, stadium) are mainly used for **visual enhancement**.
  Their animations and interactions are not fully optimized or physically accurate.

* Some game mechanics (like physics and analysis) are implemented in a **simplified or approximated way** rather than fully realistic simulation.

* Due to assignment scope and time limitations, certain advanced features are handled in a **basic or indirect manner**.

---

## 🧱 Technologies Used

* HTML
* CSS
* JavaScript
* Three.js (for 3D rendering)

---

## 🎯 Learning Outcome

Through this project, I was able to understand:

* Basics of 3D scene creation using Three.js
* Smooth movement using interpolation (LERP)
* Collision detection techniques
* Event handling in JavaScript
* Applying theoretical concepts (Fitts’s Law) in a practical project

---

## ✅ Conclusion

This project is an attempt to combine **3D game development** with **basic human interaction analysis**.
Although not fully optimized, it demonstrates the core concepts and fulfills the main objectives of the assignment.
