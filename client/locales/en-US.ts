// locales/en-US.ts
export default {
  home: {
    title: "Home",
    callout: "Made by the community, for the community.",
    slogan: "A new approach in molecular dynamics automation with GROMACS.",
    description:
      "Welcome to the new Visual Dynamics.\nWith a renewed interface and a new methodology for generating and running GROMACS simulations, we seek to run simulations with more control in less time.",
    features: {
      "runs-on-cloud": {
        title: "Cloud or on-premises execution",
        description:
          "Molecular dynamics requires a lot of computing power, so we also offer a way to run in the cloud. We run 3 simultaneous MDs, with 10 CPU cores each."
      },
      "open-source": {
        title: "Open Source",
        description:
          "We know that running an MD is not easy, with that in mind, we keep developing this open source automation software, made by the community, for the community."
      }
    }
  },
  login: {
    title: "Login",
    errors: {
      user: {
        inactive:
          "This user hasn't been activated yet. We'll contact you via email when your account passes our validations.",
        "wrong-credentials":
          "This combination of username/email and password doesn't exists in our servers.",
        deleted: "This account has been disabled."
      }
    },
    identifier: {
      title: "Email or Username",
      placeholder: "user@uni.edu",
      errors: {
        empty: "Can't be empty"
      }
    },
    password: {
      title: "Password",
      errors: {
        empty: "Can't be empty"
      }
    },
    "lost-password": "I forgot my password",
    "new-user": "Register"
  },
  navigation: {
    auth: {
      login: "Login",
      register: "Register",
      role: {
        admin: "Administrator",
        user: "User"
      },
      logout: "Logout"
    },
    admin: {
      title: "Administration",
      dashboard: "Dashboard",
      users: "Users",
      validation: "User Validation",
      simulations: "Simulations Status",
      settings: "Settings"
    },
    simulations: {
      "my-simulations": "My Simulations",
      title: "Simulations",
      models: {
        apo: "APO",
        acpype: "Protein + Ligand (prepared in ACPYPE)",
        prodrg: "Protein + Ligand (prepared in PRODRG) [DEPRECATED]"
      }
    },
    preparations: {
      title: "Ligand Preparation",
      models: {
        acpype: "ACPYPE Ligand Generator"
      }
    },
    system: {
      title: "System",
      about: {
        title: "About"
      },
      posts: {
        title: "Tutorials, Videos and Posts"
      },
      home: {
        title: "Home"
      }
    },
    footer: {
      releaseNotes: "About this version"
    }
  },
  register: {
    title: "Sign Up",
    alert:
      "By creating an user you'll automatically agree to our Terms of Service.\nBe aware that this user is not active by default, it'll go on a validation period and you'll be emailed about this validation.",
    errors: {
      user: {
        existing: "There's a user with this email or username already."
      }
    },
    email: {
      title: "Email",
      placeholder: "user@uni.edu",
      errors: {
        disallowed: "You must use your institutional email",
        empty: "Can't be empty",
        invalid: "This is not a valid email address"
      }
    },
    password: {
      title: "Password",
      errors: {
        empty: "Can't be empty"
      }
    },
    username: {
      title: "Username",
      placeholder: "johndoe",
      errors: {
        empty: "Can't be empty",
        invalid:
          "Alphanumeric only (a-z, A-Z, 0-9), between 4 and 10 characters"
      }
    },
    name: {
      title: "Name",
      placeholder: "John Doe",
      errors: {
        empty: "Can't be empty"
      }
    }
  }
} as const;
