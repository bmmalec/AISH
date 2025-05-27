# Web Design Standard Document

## 1. Purpose
This document defines the standards and best practices for designing modern web pages that are visually appealing, functional, and aligned with user needs. It serves as a reference for an AI agent to generate HTML5 wireframes or pages based on provided requirements, ensuring consistency, accessibility, and usability.

---

## 2. General Design Principles
- **Simplicity**: Prioritize clean, uncluttered layouts with minimal steps to achieve user goals (e.g., <10 seconds for key actions).
- **Consistency**: Use uniform typography, colors, and spacing across all pages.
- **Responsiveness**: Ensure designs adapt to various screen sizes (desktop: 1280px, tablet: 768px, mobile: 320px).
- **User-Centered**: Focus on delivering the requirement’s value (e.g., "improves coordination") through intuitive interfaces.
- **Accessibility**: Follow WCAG 2.1 guidelines (e.g., sufficient color contrast, ARIA labels).

---

## 3. Layout Structure
- **Standard Layout**: Use a three-part structure:
  - **Header**: Fixed height (60px), site title/logo (left), navigation (right if applicable).
  - **Main Content**: Flexible height, primary interaction area, split into sidebar (20%) and main section (80%) where contextually relevant.
  - **Footer**: Fixed height (40px), copyright/info (center-aligned).
- **Grid System**: Use a 12-column grid (Bootstrap-inspired) for alignment and spacing.
- **Spacing**: Consistent padding/margins (20px default, 10px for smaller elements).

---

## 4. Color Scheme
- **Primary Palette**:
  - Background: Light gray (#f8f9fa) for content areas.
  - Sidebar: Dark gray (#343a40) for navigation/context.
  - Accent: Blue (#007bff) for buttons/links.
  - Text: Dark gray (#333) for readability.
- **Contrast**: Ensure text-to-background contrast ratio ≥ 4.5:1 (e.g., #333 on #f8f9fa).
- **Hover Effects**: Lighten accent color (e.g., #e9ecef) for interactive elements.

---

## 5. Typography
- **Font Family**: `'Segoe UI', Arial, sans-serif` (modern, widely available).
- **Sizes**:
  - Headings: h1 (20px), h2 (18px), h3 (16px), bold.
  - Body Text: 14px.
  - Small Text (e.g., footer): 12px.
- **Line Height**: 1.5 for readability.
- **Weight**: Bold for headings, regular for body text.

---

## 6. Components
- **Buttons**:
  - Size: 100x40px (default), padding 10px.
  - Style: Solid fill (#007bff), white text, rounded corners (4px), hover lightens to #e9ecef with dark text.
  - Placement: Centered below forms or right-aligned for actions.
- **Forms**:
  - Inputs: Full-width (max 500px), bordered (#dee2e6), padding 10px.
  - Labels: Above inputs, bold, 14px.
  - Dropdowns: Match input style, 200px width default, arrow indicator.
- **Lists**:
  - Unordered: No bullets, padding 0, border-bottom (#eee) for separation.
  - Spacing: 8px between items.
- **Cards**:
  - Border: None, shadow (0 2px 5px rgba(0,0,0,0.1)).
  - Padding: 20px, background #fff.

---

## 7. Navigation
- **Sidebar**: 
  - Width: 250px (20% of 1280px viewport), collapsible on mobile (<768px).
  - Background: #343a40, white text (#fff), hover #495057.
  - Links: 14px, padding 10px 20px.
- **Top Navigation**: Optional, right-aligned in header if no sidebar, same styling.

---

## 8. Usability Guidelines
- **Interaction Time**: Design for key actions (e.g., form submissions) to take <10 seconds (simple layouts, minimal clicks).
- **Feedback**: Provide visual feedback (e.g., button state change) for actions.
- **Contextual Help**: Include tooltips or placeholders for complex inputs (e.g., "Select a chore").
- **Error Handling**: Display errors inline, red text (#dc3545), below affected fields.

---

## 9. Responsive Design
- **Breakpoints**:
  - Desktop: >768px, full layout.
  - Tablet: 768px-576px, sidebar collapses, main content full-width.
  - Mobile: <576px, stack all elements vertically.
- **CSS**: Use inline media queries (e.g., `@media (max-width: 768px) { .sidebar { display: none; } }`).

---

## 10. Best Practices
- **Performance**: Minimize DOM elements (<100 per page), inline CSS for wireframes to reduce requests.
- **Modularity**: Group related functionality (e.g., forms in cards, navigation in sidebar).
- **Consistency with Requirements**:
  - **Description**: Drives main content design (e.g., form for "assign chores").
  - **Benefit**: Shapes efficiency (e.g., quick actions for "reduces time").
  - **Objective**: Guides layout focus (e.g., "streamline delegation" = simple form).
  - **Value**: Enhances user experience (e.g., "improves coordination" = visible feedback).
- **Standards Compliance**: HTML5 semantic tags (`<header>`, `<main>`, `<footer>`), valid CSS.

---

### Usage by AI Agent
- **Context**: Provide this document to the AI (e.g., Grok) as a reference.
- **Input**: Requirement object (description, benefit, objective, value).
- **Instruction**: "Generate an HTML5 wireframe following the Web Design Standard Document for the given requirement."
- **Output**: HTML5 code with inline CSS adhering to:
  - Layout: Header, sidebar (if context needed), main content, footer.
  - Styling: Colors (#f8f9fa, #343a40, #007bff), typography (Segoe UI, 14px), components (buttons, forms).
  - Usability: Simple, fast, responsive design.

---

### Example Application
#### Requirement
- **Description**: "Users can assign chores to family members through a simple interface."
- **Benefit**: "Reduces task assignment time by 20%."
- **Objective**: "Streamline task delegation."
- **Value**: "Improves family coordination."

#### Generated Wireframe (Simplified HTML5)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chore Assignment</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background: #f8f9fa; }
        .wrapper { display: flex; flex-direction: column; min-height: 100vh; max-width: 1280px; margin: 0 auto; }
        .header { background: #e9ecef; padding: 20px; font-size: 20px; font-weight: bold; height: 60px; }
        .content { display: flex; flex: 1; }
        .sidebar { width: 250px; background: #343a40; color: #fff; padding: 20px; }
        .sidebar h3 { font-size: 16px; margin: 0 0 10px; }
        .sidebar ul { list-style: none; padding: 0; font-size: 14px; }
        .sidebar li { padding: 8px 0; }
        .main { flex: 1; padding: 20px; }
        .form-card { background: #fff; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .form-card h3 { font-size: 16px; margin: 0 0 10px; }
        select { width: 200px; padding: 10px; border: 1px solid #dee2e6; margin-right: 10px; font-size: 14px; }
        button { width: 100px; padding: 10px; background: #007bff; color: #fff; border: none; cursor: pointer; }
        button:hover { background: #e9ecef; color: #333; }
        .recent { margin-top: 20px; }
        .recent h3 { font-size: 16px; margin: 0 0 10px; }
        .recent ul { list-style: none; padding: 0; font-size: 14px; }
        .recent li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .footer { background: #e9ecef; padding: 10px; text-align: center; font-size: 12px; height: 40px; }
        @media (max-width: 768px) { .sidebar { display: none; } .main { width: 100%; } select { width: 100%; margin: 10px 0; } }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">Family Chore App</div>
        <div class="content">
            <div class="sidebar">
                <h3>Family Members</h3>
                <ul><li>John</li><li>Jane</li><li>Tim</li></ul>
            </div>
            <div class="main">
                <div class="form-card">
                    <h3>Assign a Chore</h3>
                    <select><option>Wash Dishes</option><option>Vacuum</option><option>Laundry</option></select>
                    <select><option>John</option><option>Jane</option><option>Tim</option></select>
                    <button>Assign</button>
                </div>
                <div class="recent">
                    <h3>Recent Assignments</h3>
                    <ul><li>John: Wash Dishes</li><li>Jane: Vacuum</li></ul>
                </div>
            </div>
        </div>
        <div class="footer">© 2025 Family Chore</div>
    </div>
</body>
</html>