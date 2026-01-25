---
name: frontend-design-minimal
description: Create clean, efficient frontend interfaces optimized for B2B SaaS applications. Use this skill when building dashboards, admin panels, data-heavy interfaces, or productivity tools. Generates production-grade code with clarity, usability, and professional restraint.
user-invocable: true
---

This skill guides creation of minimalist, productivity-focused frontend interfaces suited for B2B SaaS applications. Implement real working code with exceptional attention to clarity, efficiency, and professional polish.
The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.
Design Thinking
Before coding, understand the context and commit to a clear, functional direction:

Purpose: What task does this interface help users accomplish? What data or actions matter most?
Tone: Professional, efficient, trustworthy. The interface should feel like a well-engineered tool—invisible when working correctly, obvious when something needs attention.
Constraints: Technical requirements (framework, performance, accessibility). B2B apps often require strict accessibility compliance.
Differentiation: What makes this interface exceptionally usable? Speed, clarity, information density done right.

CRITICAL: Every element must earn its place. If it doesn't help the user complete their task faster or with more confidence, remove it.
Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

Production-grade and functional
Clean, scannable, and immediately understandable
Optimized for repeated daily use
Accessible and performant

Frontend Aesthetics Guidelines
Focus on:
Typography

System fonts first: Use system font stacks (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) for speed and familiarity. Users spend hours in these interfaces—comfort beats novelty.
Clear hierarchy: Establish 3-4 type sizes maximum. Use weight (medium, semibold) rather than size to create emphasis.
Readable density: 14-16px base for body text. Generous line-height (1.5+) for paragraphs, tighter (1.2-1.3) for UI labels.
Monospace for data: Use monospace fonts for numbers, codes, timestamps, and tabular data to ensure alignment and scannability.

Color & Theme

Neutral foundation: Build on grays. Reserve color for meaning—status indicators, interactive elements, alerts.
Semantic color usage: Green for success, amber for warning, red for error, blue for primary actions. Be consistent and predictable.
Low saturation: Desaturated, muted tones reduce visual fatigue. Avoid bright, saturated colors except for critical alerts.
Light and dark modes: Support both. Many users work long hours and prefer dark mode. Use CSS variables for seamless theming.
High contrast for data: Ensure sufficient contrast ratios (4.5:1 minimum) especially in data tables and form inputs.

Layout & Spacing

Consistent spacing scale: Use a 4px or 8px base unit. Apply it religiously: padding, margins, gaps.
Dense but breathable: B2B users often need information density, but group related items with whitespace. Use spacing to create visual hierarchy.
Predictable structure: Sidebars, headers, and content areas should be where users expect them. Innovation in layout confuses power users.
Responsive pragmatism: Many B2B apps are desktop-first. Prioritize wide-screen layouts but ensure tablet usability.

Components & Patterns

Tables are first-class: Invest in well-designed tables—sortable, filterable, with proper alignment. Right-align numbers, left-align text.
Forms that flow: Logical tab order, clear labels, inline validation, helpful placeholder text. Group related fields.
Obvious affordances: Buttons look like buttons. Links look like links. Interactive elements have clear hover/focus states.
Loading and empty states: Always design these. Skeleton loaders for content, helpful empty states with clear next actions.

Motion & Feedback

Subtle and fast: Transitions should be 100-200ms maximum. Users shouldn't wait for animations.
Purposeful only: Animate to provide feedback (button press, save confirmation) or to orient (page transitions). Never animate for decoration.
Instant feedback: Buttons should respond immediately to clicks. Loading states should appear within 100ms if an action takes longer.

Visual Details

Minimal borders: Use spacing and background color differences to separate sections. Borders add visual noise.
Subtle shadows: If using shadows, keep them soft and minimal. One level of elevation is usually enough.
Icons with purpose: Use icons to aid recognition, not decoration. Pair with text labels when space allows.
No gradients: Flat colors are cleaner and more professional. If you must use gradients, keep them extremely subtle.

Strict Prohibitions
No Emojis - Ever
Emojis are strictly prohibited in B2B SaaS interfaces. This is non-negotiable.

Do not use emojis in headings, labels, or body text
Do not use emojis in buttons, navigation, or CTAs
Do not use emojis in empty states, success messages, or error messages
Do not use emojis in tooltips, notifications, or alerts
Do not use emojis as visual indicators or status markers
Do not use emojis in placeholder text or helper text

Why: Emojis undermine professional credibility, create accessibility issues (screen readers handle them inconsistently), render differently across platforms causing visual inconsistency, and add visual noise that distracts from content. Use proper iconography (Lucide, Heroicons, or custom SVGs) when visual indicators are needed.
Additional Prohibitions

No decorative illustrations: Hero illustrations, mascots, and decorative graphics waste space and slow page loads.
No marketing language in UI: Interface copy should be direct and instructional, not promotional.
No unnecessary modals: Modals interrupt flow. Use inline expansion, slide-out panels, or dedicated pages instead.
No skeleton screens for instant operations: If data loads in under 200ms, show nothing rather than a flash of skeleton.
No rounded corners on everything: Use border-radius sparingly and consistently. 4-6px is usually sufficient.
No drop shadows on every element: Shadows should indicate elevation hierarchy, not decorate.

Implementation Priorities

Function over form: The interface works correctly before it looks good.
Performance: Fast initial load, instant interactions. Lazy load non-critical content.
Consistency: Same patterns everywhere. Users learn once, apply everywhere.
Error handling: Clear, actionable error messages. Never leave users confused.