# Project: SuperSpouse

## Vision
Create a family share app that allows family members to work on and contribute to projects, family objectives, and other family chores.

## Scope
Setup as a mobile app that allows a Family member to setup their family, adding them, securing who can access what, and setting priorities, asking for help, and helping each other to appreciate what they bring to the family

## Requirements
- R-1: The app must allow a User to create a Family Group by entering a unique Family Name and inviting members via email or phone number.
  - Benefit: Enables 90% of family setup within 5 minutes.
  - Objective: Facilitate quick family onboarding.
  - Value: Reduces barriers to app adoption for families.
  - Process: Create Family Group
  - Entity: User, Family Group
  - Use Case: A parent sets up a family group to start organizing tasks.
  - Questions:
    - Q-R-1-1: How should the app handle invitations for family members who do not respond within a specific timeframe? (To: Stakeholder, Topic: User Management, Resolved, Answer: Mark the invitation as expired after 7 days., Options: Automatically resend the invitation after 48 hours., Mark the invitation as expired after 7 days., Allow the sender to manually resend or cancel the invitation., Notify the sender and suggest alternative contact methods., Delete the invitation and require a new setup.)
    - Q-R-1-2: What should be the default access level for a newly added family member before customization? (To: UX Designer, Topic: User Management, Open, Options: Viewer (read-only access to all content)., Contributor (can edit tasks but not settings)., Admin (full access to all features)., Custom (based on the inviter’s role)., No access until manually set by an admin.)
    - Q-R-1-3: How should the app handle conflicting priorities when multiple family members set different priority levels for the same chore or project? (To: Solution Architect, Topic: Task Management, Open, Options: Default to the highest priority set by any member., Allow only admins to set final priority levels., Notify all assigned members to vote on the priority., Use the most recent priority setting as the final one., Display all priorities and let users resolve manually.)
    - Q-R-1-4: Should recognition contributions be visible to all family members or only to specific individuals? (To: Stakeholder, Topic: Recognition Features, Open, Options: Visible to all family members by default., Visible only to the sender and recipient., Customizable visibility based on user preference., Visible only to admins and the recipient., Visible in a public family feed for motivation.)
    - Q-R-1-5: Should the app allow customization of the invitation expiration timeframe by users, or should it remain fixed at 7 days? (To: Stakeholder, Topic: Invitation Policy, Open, Options: Keep it fixed at 7 days for consistency., Allow users to customize between 3 to 14 days., Allow customization only for premium users., Set different defaults based on user roles., Keep fixed but allow admin override.)
    - Q-R-1-6: How should the app visually represent expired invitations in the user interface to ensure clarity? (To: UX Designer, Topic: User Interface Design, Open, Options: Gray out expired invitations with an 'Expired' label., Move expired invitations to a separate 'Expired' tab., Display a red warning icon next to expired invitations., Hide expired invitations unless explicitly searched for., Show a tooltip with expiration details on hover.)
    - Q-R-1-7: What database or system constraints should be considered when implementing automatic expiration of invitations after 7 days? (To: Solution Architect, Topic: System Design, Open, Options: Use a scheduled job to update statuses daily., Implement a real-time check on invitation access., Store expiration timestamps for efficient querying., Ensure scalability for high-volume invitation records., Add failover mechanisms for job scheduling issues.)
    - Q-R-1-8: What security measures should be in place to prevent unauthorized access to expired invitation data? (To: Tech Advisor, Topic: Data Security, Open, Options: Restrict access to expired invitations to admins only., Encrypt invitation data after expiration., Purge expired invitation data after a set period., Log access attempts to expired invitation records., Mask sensitive fields in expired invitations.)
- R-2: The app must allow a User to add Family Members to the Family Group by specifying their role (e.g., Parent, Child) and sending an invitation link.
  - Benefit: Reduces manual coordination by 30% during member addition.
  - Objective: Simplify member inclusion.
  - Value: Improves family collaboration setup.
  - Process: Add Family Member
  - Entity: User, Family Member
  - Use Case: A parent adds a child to the family group for task sharing.
  - Questions:
    - Q-R-2-1: How should recognition features (e.g., badges, thank-you notes) be displayed or archived for long-term motivation? (To: UX Designer, Topic: Recognition Features, Open, Options: Displayed on a user’s profile permanently., Archived after 30 days but accessible in history., Visible only to the family group for a limited time., Shown in a dedicated ‘Family Achievements’ section., Deleted after a set period to keep the app uncluttered.)
- R-3: The app must provide a permission system for a User to define access levels for Family Members (e.g., Admin, Contributor, Viewer) to control who can view or edit Projects and Chores.
  - Benefit: Ensures 100% data privacy compliance for sensitive family information.
  - Objective: Secure family data access.
  - Value: Builds trust in app usage among family members.
  - Process: Set Permissions
  - Entity: User, Family Member, Project, Chore
  - Use Case: A parent restricts a child’s access to viewing only certain chores.
- R-4: The app must enable a User to create a Project or Family Objective with attributes like Project Name, Description, Deadline, and Assigned Members.
  - Benefit: Increases project setup efficiency by 25%.
  - Objective: Streamline project creation.
  - Value: Enhances family goal tracking.
  - Process: Create Project
  - Entity: User, Project
  - Use Case: A family member sets up a project for a home renovation.
- R-5: The app must allow a User to create and assign Chores with attributes such as Chore Name, Description, Priority (High, Medium, Low), and Due Date to specific Family Members.
  - Benefit: Reduces chore assignment time by 20%.
  - Objective: Optimize chore delegation.
  - Value: Improves family task coordination.
  - Process: Assign Chore
  - Entity: User, Chore, Family Member
  - Use Case: A parent assigns a cleaning task to a teenager with a deadline.
- R-6: The app must enable a User to request Help on a specific Chore or Project by notifying other Family Members with a message and priority level.
  - Benefit: Speeds up task completion by 15% through timely assistance.
  - Objective: Encourage collaborative support.
  - Value: Strengthens family teamwork.
  - Process: Request Help
  - Entity: User, Chore, Project, Family Member
  - Use Case: A child requests help from a sibling for a school project.
  - Questions:
    - Q-R-6-1: What criteria should determine when a help request is marked as urgent versus standard? (To: Stakeholder, Topic: Task Management, Open, Options: Based on the deadline (e.g., due within 24 hours = urgent)., User-defined at the time of request., Based on the task’s overall priority level., Admin-only designation for urgent status., All help requests default to urgent until resolved.)
- R-7: The app must allow a User to mark a Chore or Project as Completed and notify Assigned Members or the Family Group.
  - Benefit: Improves task tracking accuracy by 30%.
  - Objective: Provide visibility on progress.
  - Value: Enhances family accountability.
  - Process: Mark Completion
  - Entity: User, Chore, Project
  - Use Case: A family member marks a chore as done to update the group.
- R-8: The app must include a Recognition Feature for a User to appreciate a Family Member’s contribution by sending a thank-you note or badge for completed tasks.
  - Benefit: Boosts family morale by 40% through positive reinforcement.
  - Objective: Promote appreciation.
  - Value: Fosters a supportive family environment.
  - Process: Send Recognition
  - Entity: User, Family Member
  - Use Case: A parent thanks a child for completing a chore with a badge.
- R-9: The app must provide a Dashboard for a User to view all active Projects, Chores, Help Requests, and Priorities at a glance.
  - Benefit: Reduces time to access key information by 50%.
  - Objective: Centralize family task visibility.
  - Value: Improves family organization.
  - Process: View Dashboard
  - Entity: User, Project, Chore
  - Use Case: A family member checks the dashboard to see pending tasks.
- R-10: The app must send Notifications to a User for upcoming Deadlines, Help Requests, or Task Updates via push notifications or in-app alerts.
  - Benefit: Increases task completion rate by 20% through timely reminders.
  - Objective: Ensure timely task awareness.
  - Value: Reduces missed deadlines in family planning.
  - Process: Send Notification
  - Entity: User, Chore, Project
  - Use Case: A parent receives a reminder for a chore deadline.
- R-11: The app must automatically mark an invitation as 'expired' if a family member does not respond within 7 days, updating the invitation status attribute in the database.
  - Benefit: Reduces manual tracking by 100% for expired invitations, saving an estimated 2 hours per week for administrative users.
  - Objective: Automate the expiration process to ensure timely status updates.
  - Value: Enhances user experience by maintaining accurate invitation statuses and supports business efficiency by reducing administrative overhead.
  - Process: Invitation Expiration Process
  - Entity: Invitation
  - Use Case: A family member receives an invitation to join the app but does not respond within 7 days, triggering an automatic status update to 'expired'.
- R-12: The app should notify the inviting user via email or in-app notification when an invitation status changes to 'expired', including the family member’s name and expiration date as attributes.
  - Benefit: Increases user engagement by ensuring 95% of inviting users are informed of expired invitations within 24 hours.
  - Objective: Keep users informed of invitation outcomes to maintain transparency.
  - Value: Improves trust and communication with users by providing timely updates on their invitations.
  - Process: Notification Process
  - Entity: User Notification
  - Use Case: An inviting user receives a notification when a family member’s invitation expires after 7 days.
- R-13: The app must allow users to resend an expired invitation to the same family member, creating a new invitation entity with a reset 7-day expiration timeframe.
  - Benefit: Increases invitation acceptance rate by at least 10% by enabling follow-up actions.
  - Objective: Provide flexibility for users to re-engage non-responsive family members.
  - Value: Supports user retention and family onboarding by facilitating repeated outreach.
  - Process: Invitation Resend Process
  - Entity: Invitation
  - Use Case: A user identifies an expired invitation and chooses to resend it, creating a new invitation record.

## Epics


## Prompt History


## Stopped Topics
