# PROMPTS — AI Collaboration Record

This document records the available raw user prompts used during the Codex-assisted development of the Car Dealership Inventory System.

The prompt text below is preserved verbatim to meet the kata requirement for transparent AI usage. Formatting, headings, and the prompt index are provided only to make the record easier to review.

## Prompt index

| Area | Topics covered |
| --- | --- |
| Planning | Technology choice, architecture, repository naming, and commit strategy |
| Backend | MongoDB configuration, Thunder Client testing, API completion, and local setup |
| Frontend | Dashboard, authentication experience, inventory management, and customer purchase flow |
| UX | Confirmation dialogs, loading states, and pop-up purchase results |
| Delivery | GitHub publishing, environment safety, and AI-use documentation |

## Raw prompts

---

## User

Hii I'm building a project. the detailes are:
help me build this by learning What exactly I'm doing in depth such that I can built the project well and explain my learning clearly

## User

I want MongoDB. Also tell me the commits that I need to do to my git repo, also suggest a good repo name

## User

give the best architecture to build this project end to end and then start working on the given architecture

## User

in what git repo are you adding?

## User

add in this git repo:
[https://github.com/Anvitha-neena/car-dealership-inventory.git](https://github.com/Anvitha-neena/car-dealership-inventory.git)

## User

ok continue building

## User

ok is the backend part done? can I test it using thunderClient myself manually

## User

ok so complete the backend part completely

## User

I've already placed my mono uri and jwt secret in backend/.env

## User

how do I run this in terminal
I did cd backend now what?

## User

Unable to start API. Error: MONGODB_URI must be set.

## User

meanwhile I test the backend manually using API's you start working on frontend. But before that give a clean set of API's that I must call in thunderClient for testing

## User

is the frontend part done?

## User

then complete the frontend fully

## User

is the total project done completely end to end? did you connect frontend to backend? can I start the application now?

## User

I want a dashboard, login for admin too

## User

fo admin there must no register. in that case any user can create a account as admin right

## User

so remove register option for admin then

## User

when the customer clicked on purchase button if the vehicle is in stock pop up a message like vehicle name successfully purchased else pop a message that vehicle is out of stock

## User

Add a confirmation dialog.

Instead of deleting immediately in admin section.

Buttons should temporarily change while waiting.

Example:

Before

Purchase Vehicle

During

Purchasing...

Restock

Restocking...

Add Vehicle

Adding...

## User

a pop up must come not a message

## User

push all the recent chnages to git. aslo create a `PROMPTS.md` that must contain the required raw AI chat transcript
