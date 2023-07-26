# Transparent Changes

This project supports project managers, software developers or SaaS providers to communicate changes in their software
to customers. Further it is possible to record incidents and report on their state. Customer can access the information
directly from the web, via REST APIs or they can sign up for e-mail notifications.

## Important Entities

This section will briefly discuss the most important entities in the system and describe their relationships.

### Base Fields

**TODO: ** from projectboard take the `BaseItem` this way every entity has a `createdAt`, `createdBy`, etc. field, and
we  do not need to redundantly describe in the following sections.

### Multilingual Text

Throughout the system we operate with much text which will be consumed by users speaking different languages. The system
makes it possible that texts are provided in different languages and even allows to automatically translate texts to
other languages using the DeepL integration.

**Multilingual Text**: `MultilingualText`

 - `language: string` 2-digit ISO code of the language
 - `text: string` the actual text
 - `machineTranslated: boolean` indicates if the text was automatically translated by a machine translation system

 **Structure to lookup texts**: `[key: string]: MultilingualText -> MultilingualTexts`

### Organisations and Users

An organisation is the central entity and owner of all other data. Users (see next section) can have roles in
organisations. A single user can be part of multiple organisations and can have different roles in different
organisations. A user can always just create an organisation, if a user is not part of any organisation yet, then the
UI should allow the user to create an organisation.

Users are invited to other organisations, on the login screen they will see all invites. If an invitation is accepted
the user will get a role in the inviting organisation.

**Organisation:**

 - `slug: string` is a max 255 character long, case-insensitive slug which should be useable as part of a URL.
 - `name: string` human readable name of the organisation
 - Other fields from `BaseItem`

**User:**

**Role:**
 
### Project

Each organisation can have an unlimited number of projects. Projects are the container which wraps up changelogs and
incidents.

 - `slug: string` is a max 255 character long, case-insensitive slug which should be usable as part of a URL.
 - `name: MultilingualTexts ` human readable name of the Project usually this will just be one name, but it could also
   be multilingual if the project name should be translated to other languages.
 - Other fields from `BaseItem`

### Changelog

Each project can have an unlimited number of change log entries.

 - `slug: string` is a max 255 character long, case-sensitive slug which should be usable as part of a URL. Usually this 
   will be the version or tag that the change log entry describes e.g. `2.4.0`.
 - `title: MultilingualTexts` a human-readable title of the change log entry. If not provided we will use the slug as 
   the title.
 - `state: ChangelogState` can be changed on each save, possible states will be `Draft` and `Published`.
 - `description: MultilingualTexts` a human-readable description of the change log entry in Markdown format.
 - Other fields from `BaseItem`

### Incident

Each project can have an unlimited number of incidents.

 - `incidentId: string` is an ISO formatted timestamp which uniquely identifies an incident. The timestamp is the time
   of creating the incident in the system.
 - `title: MultilingualTexts`
 - `state: IncidentState` not to be edited directly but rather by adding comments.
 - `criticality: Criticality` criticality of the incident, not to be edited directly but rather by adding comments.
 - Other fields from `BaseItem`

The incident itself should not have a real description and a state but rather a list of comments where the most current
one (based on its timestamp) is the current description of the incident. This means on incident creation the first
description already needs to be provided. On an existing incident a user who has the permissions to comment when adding
a comment will have the most current comment as a template in the editor. This basically allows DevOps to keep external
stakeholders informed about incidents during the hectic of an incident response situation.

**IncidentState**: Enum with the following values: `New`, ``

**Comment**:

 - `incidentId: string` refers to the incident this comment relates to.
 - `commentId: string` is an ISO formatted timestamp which uniquely identifies a comment and allows us to sort by this create timestamp.
 - `state`
 - `criticality`
 - `comment: MultilingualTexts` the actual comment text in multiple languages.




