
# Firebase Authentication with Next.js

This project demonstrates how to implement authentication in a Next.js application using Firebase. Users can create an account and log in using either their Google account or an email/password combination.



## Features

- Email/Password Authentication: Users can sign up and log in using their email and password.
- Live previews
- Google Authentication: Users can sign up and log in with their Google account.
- Firebase Integration: Fully integrated with Firebase for user authentication.


## Run Locally

Clone the project

```bash
  git clone https://github.com/alihassnain-github/nextjs-firebase-authentication.git
```

Go to the project directory

```bash
  cd nextjs-firebase-authentication
```

Install dependencies

```bash
  npm install
```

## Configure Firebase:

 - [Create a Firebase project at Firebase Console.](https://console.firebase.google.com/u/0/?_gl=1*1x8275p*_ga*NjE3NjExODM5LjE3Mjg5OTUxMjU.*_ga_CW55HF8NVT*MTczNTY1MTEzNC4zNy4xLjE3MzU2NTEyODAuNjAuMC4w)
 - Enable Email/Password Authentication and Google Authentication in the Firebase console.
 - Obtain your Firebase config object and add it to your project in ./utils/firebase/config.js.

Install dependencies
```bash
 npm run dev
```
Open your browser at http://localhost:3000 to see the application in action.
## Technologies Used:

**Next.js:** Framework for server-side rendering and static web applications.

**Firebase:** Authentication service to handle user login and registration.

**React:** Frontend library used in this project.


## License:


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

