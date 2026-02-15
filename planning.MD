## Project Planning

### 1. Project Overview
This project is a rebuild of a political website called "Pudemo". The website is about a political party in Swaziland.
The party is about the liberation of Swaziland from monarchical rule to democratic rule.

### 2. Goals and Non-Goals (critical)
    # Goals
    - Provide a desktop and mobile responsive website for the political party.
    - Provide a platform for the political party to communicate with the public.
    - Provide a platform for the political party to share their manifesto and policies.
    - Provide a platform for the political party to share their history and achievements.
    - Provide a platform for the political party to onboard members.
    - Provide a platform for the political party to allow for donations
    - Provide a platform for the political party to allow for volunteers

    # Non-Goals
    - Limit the website to only party colours (red, yellow, green, black, white)
    - Remove Blog page and all associated links to it. 


### 3. Tech Stack
- Frontend-Backend: Next.js
- Database: PostgreSQL
- Deployment: Vercel
- Styling: Tailwind CSS
- Container: Docker
- ORM: Prisma
- Authentication: BetterAuth

### 4. Project Structure
- src/
    - app/
    - components/
    - lib/
    - prisma/
    - types/
    - utils/
- public/
- assets/

### 5. Development Steps
- Create the database schema
    - In the "dev assets" folder are 3 JSON files that can be used to create the database schemas for a form
        - Branches.json
        - CountryCode.json
        - Structures.json
- Create the admin dashboard
- Create the frontend
    - In the "assets" folder there is a folder called "pudemo-logo" that contains the logo of the party. This should be used as the logo for the website.
    - In the "assets" folder there is a folder called "mario_header" that contains the header image for the website. This should be used as the header image for the website.
    - In the "dev assets" folder there is a "UpdateProfileForm.jsx" file that can be used as a reference for the form to 
    onboard members. This form is a good example of how to use the database schema from the JSON files.
    - The structure of the front end should be similar to the following site "https://vox-populi.bold-themes.com/party/"
    - The website should have the following pages
        - Home
        - About
        - Manifesto
        - Contributions
        - Contact
- Create the API
- Create the authentication
- Create the deployment

### 6. Testing
- The website should be responsive on desktop and mobile devices
- The website should be responsive on tablet devices
- The website should be responsive on large screens
- The website should be responsive on extra large screens

### 7. Deployment
- The website should be deployed on Vercel
- The website should be deployed on Docker
- The website should be deployed on a VPS

### 8. AI Agent Instructions
- Always read the planning.md before making changes
- Always ask for clarification if something is not clear
- Always follow the instructions in the planning.md
- Always follow the instructions in the development steps