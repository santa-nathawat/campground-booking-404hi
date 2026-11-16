# Submission, diagrams, and live demo

Source: instructor submission instructions supplied by the team in chat; supplemented by course introduction p8 and Chapter 6 REST pp32-33. This is a preparation checklist, not completed delivery evidence.

## Submitted presentation

Submit one presentation file, such as PPT or PDF. A separate written report is not required. Repository documentation supports development and preparation.

- [ ] Assigned Topic 2 problem and its required behavior.
- [ ] Code changed relative to the actual Assignment 7 baseline, with concrete code/diff examples.
- [ ] Use-case diagram.
- [ ] Class diagram using the taught REST UML Profile.
- [ ] Sequence diagram(s) for relevant changed behavior.
- [ ] Team work division supported by GitHub Contributors evidence.
- [ ] Extra-credit claim list: currently **None**. If scope changes, each claim needs its tutorial video link; the supplied instructions do not require diagrams for those additions.
- [ ] Link to the project GitHub repository.
- [ ] Links to larger diagram images when embedded figures are hard to read; verify sharing permissions.

## Diagram conventions

Chapter 1 pp18-20 identifies resources, roles, and an access-rights matrix before the use-case diagram. Model the campground system and distinguish registered-user actions from administrator powers.

Chapter 6 REST p32 uses `<<Application>>`, `<<Resource>>`, `<<Representation>>`, `<<Path>>`, and HTTP operation stereotypes such as `<<GET>>` and `<<POST>>`. Show resource paths, operations, representations, and their fields. A database ER diagram alone does not satisfy this example of Class Diagram (UML Profile).

Chapter 6 REST p33 shows request and response flow through server, router, controller, model, and database. Adapt sequence diagrams to the chosen implementation and show relevant authentication, ownership, duration-validation, and failure paths where appropriate.

Keep editable diagram sources with exported figures when diagrams are authored. The lectures link PlantUML examples; the exact authoring tool remains open. Diagrams may focus on changes from the original, as permitted by the supplied submission instructions. Select their final coverage after the implementation design is agreed.

## Live program demo

Demonstrate the real running program separately; the user-supplied instructions say the demo need not be embedded in the slides. The course introduction p8 specifies Postman Runner or Newman and a presentation of at most 7 minutes plus at most 3 minutes for questions; confirm any newer timing announcement before presentation day.

- [ ] Reproducible campground data, administrator, and two ordinary users.
- [ ] Registration/login/logout with the agreed semantics.
- [ ] Campground list with required fields.
- [ ] Successful stays of up to three nights and rejection beyond the limit.
- [ ] Owner booking reads/edits/deletes and cross-user denial.
- [ ] Administrator access to both users' bookings.
- [ ] Sanitized saved collection/environment templates and meaningful assertions.
- [ ] Response-time evidence tied to documented test conditions.
- [ ] Cleanup or reset steps so interrupted demo runs can be repeated.

## Team evidence

Team member names, task ownership, and completed contributions are not yet recorded. Add actual assignments and links to commits/PRs as work happens; show GitHub Contributors in the presentation. Do not fabricate contributions.
