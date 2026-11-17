# WedPlan design system

This is the shared visual language for WedPlan. Keep new screens calm, editorial,
and practical. Change the system deliberately when the product grows.

## System

- Genre: editorial
- Shape: asymmetric split screen with a focused form
- Tone: warm, considered, quietly celebratory
- Posture: restrained, with teal as a signal colour
- Primary axis: left-biased

## Tokens

The source of truth is `src/app/globals.css`.

- Paper: `--background`, `--secondary`, and `--muted`
- Ink: `--foreground` and `--muted-foreground`
- Signal: `--primary` and `--primary-foreground`
- Lines: `--border` and `--input`
- Focus: `--ring`
- Body: DM Sans, 16px minimum, comfortable line-height
- Display: Cormorant Garamond, used for headings and the wordmark
- Radius: `--radius`, with smaller controls derived from it

## Layout

- Use a centred container with generous breathing room.
- Prefer asymmetric two-column compositions over centred stacks.
- On small screens, stack the brand panel before the form.
- Keep forms narrow enough to scan, with visible labels above every field.
- Use hairlines and paper changes for structure instead of nested cards.

## Controls

- Primary actions use the filled primary token and a clear verb.
- Secondary actions use an outline or text treatment.
- Inputs are at least 48px tall with stable 1px borders.
- Every interactive element has a visible `:focus-visible` state.
- Loading, error, and disabled states must preserve the control’s layout.

## Auth screens

- Sign in: “Welcome back to your plans.”
- Sign up: “Make room for the good part.”
- Both screens share the same shell and form primitives.
- Authentication errors are shown beside the form and never hidden.
- Successful authentication returns the user to `/`.
