# Project: SuperSpouse

## Vision
create a mobile app called SuperSpouse, that allow couples to help and support each other in running a household or a family. System should allow a family member to basically start a family and invite family members to join, this will limit the visibility to who can access the family information. App should support offline use. App should make it easy to either log or request assistance with common household chores. Create an initial list of common household chores

## Scope
Create requirements for becoming a member, creating a family, adding members, logging or requesting chores and assigning, allow for the management of their own custom chore list


## Requirements
- R-1: User Registration: Users must be able to register with an email address, password, and profile name. Attributes include: Email, Password, Profile Name. [Epic: Orchestrate 1]
  - Benefit: Ensures only verified users can join, reducing spam or unauthorized access.
  - Objective: Secure user onboarding
  - Value: Provides a safe environment for family interactions
  - Process: Registration
  - Entity: User
  - Use Case: A new user wants to create an account to join or form a family group.
- R-2: Family Creation: After registration, users should be able to create a family group. Attributes include: Family Name, Family ID. [Epic: Orchestrate 1]
  - Benefit: Allows families to maintain privacy and control over who can see family information.
  - Objective: Establish family privacy
  - Value: Enhances user control over data visibility
  - Process: Family Creation
  - Entity: Family
  - Use Case: A user wants to start a new family group to coordinate household tasks.
- R-3: Invite Members: Family creator or admin can send invites to join the family group via email or in-app link. [Epic: Orchestrate 1]
  - Benefit: Streamlines the process of adding family members, reducing manual entry errors.
  - Objective: Simplify family expansion
  - Value: Improves family coordination and communication
  - Process: Invitation
  - Entity: User
  - Use Case: A family member wants to add another member to the family group.
- R-4: Chore Logging: Users should be able to log completed chores. Attributes include: Chore Name, Date, Assigned User, Status. [Epic: epic 3]
  - Benefit: Provides a clear record of task completion, reducing disputes and oversight.
  - Objective: Track task completion
  - Value: Encourages accountability and transparency within the family
  - Process: Logging
  - Entity: Chore
  - Use Case: A user wants to log that they have cleaned the kitchen.
- R-5: Chore Request: Users should request assistance with chores. Attributes include: Chore Name, Requested By, Priority, Due Date. [Epic: epic 3]
  - Benefit: Reduces the time spent coordinating tasks manually.
  - Objective: Facilitate task delegation
  - Value: Enhances family teamwork and chore management
  - Process: Requesting
  - Entity: Chore
  - Use Case: A user needs help with taking out the trash.
- R-6: Custom Chore List: Users should be able to manage their own list of chores, adding, editing, or removing chores. [Epic: epic 5]
  - Benefit: Allows personalization to fit the unique needs of each family.
  - Objective: Personalize task management
  - Value: Increases user engagement and satisfaction
  - Process: List Management
  - Entity: Chore
  - Use Case: A user wants to add 'water the plants' to the family chore list.
- R-7: Offline Mode: The app should function in offline mode, syncing data when an internet connection is available. [Epic: epic 5]
  - Benefit: Ensures continuous usability even in areas with poor internet connectivity.
  - Objective: Provide seamless user experience
  - Value: Enhances user reliability and trust in the app
  - Process: Data Sync
  - Entity: App
  - Use Case: A user is at a cabin with no internet but still wants to log chores.

## Questions
- Q-1: How should the app handle user authentication for security? (To: Tech Advisor, Topic: User Management, Open, Options: Two-Factor Authentication, Single Sign-On with Google/Facebook, Password Complexity Requirements, Biometric Authentication, Email Verification)
- Q-2: What is the process for a user to leave or remove another member from a family group? (To: UX Designer, Topic: User Management, Open, Options: Admin Only Can Remove, Mutual Consent Required, Self-Removal Option, Voting System for Removal, Immediate Removal by Creator)
- Q-3: How should the app handle data when transitioning from offline to online mode? (To: Solution Architect, Topic: Data Handling, Open, Options: Automatic Sync on Connection, Manual Sync Option, Queue Data for Sync, Conflict Resolution Protocol, User Notification on Sync)
- Q-4: What are the priority levels for chores and how are they managed? (To: Stakeholder, Topic: Task Management, Open, Options: High, Medium, Low, Urgent, Important, Routine, No Priority System, User-Defined Priority, Priority Adjusted by Frequency)

## Epics
- Orchestrate 1: R-1, R-2, R-3
- epic 3: R-4, R-5
- epic 5: R-6, R-7

## Prompt History


## Stopped Topics
