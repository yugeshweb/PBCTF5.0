# PBCTF 5.0 Design System

## Overview
PBCTF 5.0 is a premium cybersecurity competition landing page. The design embraces a sleek, modern cyberpunk and space theme, combining intense neon accents with deep, dark backgrounds. Interactive elements like 3D backgrounds (Three.js), scroll animations (GSAP), and glitch effects establish a high-tech, hacker-centric aesthetic.

## Color Palette

The color system is built around deep blacks and vibrant, glowing neon accents to create a cyberpunk feel.

| Role | Hex | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **Background (Base)** | `#050505` | `rgb(5, 5, 5)` | Main body background |
| **Background (Elevated)** | `#0A0A0A` | `rgb(10, 10, 10)` | Elevated surfaces, glassmorphism base |
| **Background (Card)** | `#0D0D0D` | `rgb(13, 13, 13)` | Component cards |
| **Primary Accent** | `#00FF88` | `rgb(0, 255, 136)` | Primary buttons, active states, glowing elements |
| **Secondary Accent** | `#8CFF00` | `rgb(140, 255, 0)` | Highlights, secondary call-to-actions, gradients |
| **Primary Text** | `#FFFFFF` | `rgb(255, 255, 255)` | Headings and primary body copy |
| **Secondary Text** | `#E0E0E0` | `rgb(224, 224, 224)` | Subtitles and supporting text |
| **Muted Text** | `#A0A0A0` | `rgb(160, 160, 160)` | Less important metadata, placeholder text |

### Gradients and Glows
- **Primary Glow**: `rgba(0, 255, 136, 0.4)` - Used for box-shadows on hover states.
- **Gold Button Gradient**: `linear-gradient(135deg, #8CFF00, #7BE800)`

## Typography

The typography leverages modern, geometric sans-serif fonts to complement the technical theme.

- **Hero Headings**: `'Space Grotesk', sans-serif` - Used for the largest, most impactful titles.
- **Headings & Body**: `'Lexend', sans-serif` - Used for general headings, body text, and monospace-like labels.

### Type Scale
- **Hero**: `clamp(2.5rem, 6vw, 5rem)`
- **H1 - H6**: Scales down from `4rem` to `1rem` based on context.
- **Body Base**: `1rem` (16px)
- **Labels/Tags**: `0.75rem` (12px)

## Visual Effects & Themes

1. **Space & Cyberpunk Aesthetics**:
   - `StarsBackground`: A 3D interactive particle background built with Three.js/React Three Fiber.
   - `Cyber Grid`: A subtle geometric grid overlay (`linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px)`) in the background.
   - `Scanlines`: A fixed overlay (`linear-gradient`) creating an old-school CRT monitor scanline effect.
   - `CRT Flicker`: Subtle opacity animations mimicking screen flicker.

2. **Glassmorphism**:
   - Used for floating UI elements like the Header or Modals.
   - Background: `rgba(10, 10, 10, 0.7)` with `backdrop-filter: blur(24px)`.
   - Borders: Subtle white borders `rgba(255, 255, 255, 0.08)`.

3. **Motion & Interaction**:
   - **Scroll Animations**: GSAP and ScrollTrigger are heavily used to reveal elements as the user scrolls.
   - **Micro-interactions**: Framer Motion powers smooth transitions, hover effects on buttons (glows and transforms), and card elevations.
   - **Loader**: A glitch-effect loading screen that transitions smoothly into the main website.

## UI Components & Structure

The landing page consists of the following modular sections:
- **Loader**: Initial glitch loading sequence.
- **Header**: Fixed glassmorphism navigation.
- **Hero**: The main landing viewport with the CTF title and primary Call-To-Action (CTA).
- **Mission Brief**: Introduction to the event.
- **Timeline**: Chronological schedule of the competition.
- **Categories**: Breakdown of CTF challenge types (e.g., Web, Crypto, Pwn).
- **Prizes**: Reward tiers.
- **Sponsors**: Logos and tiers for event backers.
- **About PointBlank**: Information about the organizing entity.
- **Venue**: Location details (if hybrid/offline) or platform details.
- **FAQ**: Accordion-style frequently asked questions.
- **Final CTA**: Bottom page anchor to drive registrations.
- **Footer**: Links, socials, and copyright.

## Borders & Radii
- **Cards & Modals**: `16px` to `24px` for softer, modern edges.
- **Buttons**: `6px` for sharp, actionable elements.

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Vanilla CSS (`index.css`) with Custom Properties
- **3D/Graphics**: Three.js, React Three Fiber, Drei, postprocessing
- **Animations**: GSAP, Framer Motion (`motion/react`)
- **Other**: `face-api.js` (potentially used for an interactive webcam feature or easter egg).
