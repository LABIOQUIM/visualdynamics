// locales/en-US.ts
export default {
  about: {
    acknowledgements:
      "Thanks to the entire teams responsible for the development and maintenance of GROMACS, Grace/Xmgr and ACPYPE",
    description:
      "Visual Dynamics is an open source tool that accelerates implementations and learning in the area of molecular dynamics simulation. Available for free and supported by all major web browsers. Visual Dynamics is powered by Flask and NextJS, both are free and open-source frameworks for web development.",
    maintainers: {
      title: "Maintainers",
      active: "Active",
      inactive: "Previous"
    },
    title: "About",
    work: {
      code: "Code development",
      idea: "Idea and concept",
      manuscript: "Publication writing"
    },
    publication: {
      title: "Publications"
    }
  },
  admin: {
    settings: {
      title: "Settings",
      app: {
        title: "App Settings",
        maintenanceMode: "Maintenance Mode"
      },
      md: {
        title: "Update md_pr.mdp values",
        nsteps: "NSteps",
        dt: "dt (ps)"
      },
      submit: "Update"
    },
    users: {
      title: "User Management",
      clean: {
        title: "Clean user simulations folder",
        description:
          "Are you sure you want to clean the folder of user {username}?",
        success: "{username}'s simulations folder has been cleaned",
        error: "Failed to clean {username}'s simulations folder"
      },
      filters: {
        identifier: "Filter by identifier"
      },
      "un-block": {
        title: "Disable or Re-enable User",
        "button-block": "Disable User",
        "button-unblock": "Re-enable User",
        block: "Are you sure you want to disable the user {username}?",
        unblock: "Are you sure you want to re-enable the user {username}?",
        success: "User {username} has been disabled/re-enabled",
        failed: "Couldn't disable/re-enable user {username}"
      },
      "see-more": {
        title: "See more info",
        dialog: {
          title: "{username}'s info",
          description:
            "This is the file tree for the user {username}. You can click in any file to download."
        }
      }
    },
    simulations: {
      title: "Simulations Status",
      active: "Active Simulations",
      queued: "Queued Simulations",
      simulation: {
        path: "Folder on storage",
        "started-at": "Started at",
        username: "Username",
        actions: "Actions"
      },
      "no-contact": "The Cloud Worker is unreachable",
      "worker-empty": "There are no tasks running/waiting on this worker",
      "trigger-run": {
        title: "Trigger Run",
        description:
          "Manually trigger a run from any user with his folder path and email",
        form: {
          folder: {
            label: "Folder Path",
            empty: "Can't be empty"
          },
          email: {
            label: "Email",
            empty: "Can't be empty",
            invalid:
              "Alphanumeric only (a-z, A-Z, 0-9), between 4 and 10 characters"
          }
        },
        success: "Run requested",
        failed: "Failed to request this run"
      }
    },
    validation: {
      title: "Sign Up Requests",
      empty: "There is no one left to be reviewed",
      approve: "Approve",
      reject: "Reject",
      "show-rejected-users": "Show previously rejected users"
    }
  },
  common: {
    "app-name": "Visual Dynamics",
    abort: "Abort run",
    limitations: "Make sure to check out our Tutorials on the sidebar/menu",
    errors: {
      "404": {
        title: "This place... isn't a place at all",
        description:
          "Seems like you found something that can't be found. Just so you know, we recommend you to go back the way you came.",
        "back-to-home": "Go back to Home"
      },
      "failed-to-fetch":
        "Ops... Something happened and we couldn't connect to our servers."
    },
    loading: "Loading...",
    blog: {
      readtime: "{{minutes}} min read"
    },
    cancel: "Cancel",
    of: "of",
    maintenance:
      "Visual Dynamics is in Maintenance Mode, so you can't submit new simulations for the time being."
  },
  docs: {
    back: "Back to VD",
    title: "Documentation"
  },
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
          "This combination of username/email and password doesn't exist in our servers.",
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
      cms: "Directus (CMS)",
      dashboard: "Dashboard",
      users: "Users",
      validation: "User Validation",
      simulations: "Simulations Status",
      settings: "Settings"
    },
    simulations: {
      "new-simulation": "New Simulation",
      "my-simulations": "My Simulations",
      title: "Simulations",
      models: {
        apo: "APO",
        acpype: "Protein + Ligand (prepared in ACPYPE)",
        prodrg: "Protein + Ligand (prepared in PRODRG)"
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
      about: "About",
      docs: "Documentation",
      knowledge: "Tutorials",
      home: "Home"
    },
    footer: {
      releaseNotes: "About this version"
    }
  },
  "new-simulation": {
    description: {
      apo: "",
      acpype: "",
      prodrg: ""
    },
    form: {
      warnings: {
        hm5ka:
          "Please, be aware that molecules with more than 10000 atoms will not execute, so please double check it before sending it to the queue.",
        analysis:
          "Simulations of structures with multiple chains work, but generate unproductive analyzes (RMSD, RMSF, RG and SASA). We are working on this automation."
      },
      submit: {
        download: "Download command list",
        run: "Run dynamic"
      },
      "file-pdb": {
        title: "Molecule (.pdb)",
        errors: {
          "no-pdb": "Select a .pdb molecule file"
        }
      },
      ns: {
        title: "Simulation Time",
        info: "If your simulation requires more than 5ns, please contact us via fernando.zanchi@fiocruz.br"
      },
      "file-itp": {
        title: "Ligand (.itp)",
        errors: {
          "no-itp": "Select a ligand .itp file"
        }
      },
      "file-gro": {
        title: "Ligand (.pdb)",
        errors: {
          "no-gro": "Select a ligand .pdb file"
        }
      },
      "force-field": {
        title: "Force Field",
        placeholder: "Select a force field",
        errors: {
          "no-force-field": "Select a force field"
        }
      },
      "water-model": {
        title: "Water Model",
        placeholder: "Select a water model",
        errors: {
          "no-water-model": "Select a water model"
        }
      },
      "box-type": {
        title: "Box Type",
        placeholder: "Select a box type",
        errors: {
          "no-box-type": "Select a box type"
        }
      },
      "box-distance": {
        title: "Box Distance (nm)",
        errors: {
          "distance-doesnt-match": "Should be a number, decimal or not.",
          "out-of-bounds": "Must be between 0.1 and 1"
        }
      },
      neutralize: {
        title: "Neutralize system"
      },
      ignore: {
        title: "Ignore hydrogens"
      },
      double: {
        title: "Use double precision"
      },
      run: {
        title: "Run in our servers"
      },
      options: "Options"
    },
    title: "New Simulation"
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
  },
  reset: {
    alerts: {
      passwordmigration:
        "We detected that you account go back to Visual Dynamics v1. Before using VD again, please reset your password to complete the migration."
    },
    "reset-form": {
      title: "Reset Password",
      password: {
        title: "New Password",
        errors: {
          "min-length": "Your password must be at least 6 characters long"
        }
      },
      errors: {
        failed:
          "We couldn't change your password. Either this link is expired and/or already used or the user to which this link was issued to doesn't exist."
      },
      reseted:
        "Your password has been reset. You can now sign in and continue using Visual Dynamics"
    },
    "request-form": {
      title: "Request Password Reset Link",
      identifier: {
        title: "Username or Email",
        placeholder: "user@uni.edu",
        errors: {
          empty: "This field is required."
        }
      },
      errors: {
        "no-user": "Couldn't find an user/account with this username/email",
        "sendmail-failed": "Couldn't send the email."
      },
      success:
        "We've mailed you a reset password link. It'll be valid for 10 minutes only."
    },
    title: "Reset Password"
  },
  "running-simulation": {
    title: "Your Dynamic is Running",
    description: "Info",
    abort: "Abort",
    type: "Simulation Type: {simulationType}",
    molecule: "Molecule: {moleculeName}",
    createdAt: "Generated at: {formattedDate}",
    logs: {
      title: "Realtime Execution Logs"
    },
    steps: {
      topology: "Topology Definition",
      solvate: "Defining Box and Solvating",
      ions: "Adding Ions",
      minimizationsteepdesc: "Min: Steep Descent",
      minimizationconjgrad: "Min: Conjugate Gradient",
      equilibrationnvt: "Restrict: NVT",
      equilibrationnpt: "Restrict: NPT",
      productionmd: "Produce: MD",
      analyzemd: "Analysis: MD",
      title: "Steps"
    },
    "not-running": {
      title: "There is no simulation running",
      description:
        "Seems like you don't have any simulation running in our servers. Start one clicking a button below."
    },
    queued: {
      title: "You have a queued simulation",
      description:
        "You simulation will start automatically when a spot opens in our execution queue"
    }
  },
  simulations: {
    title: "My Simulations",
    "auto-refresh": "Refreshing in {seconds} seconds.",
    "no-sim-yet": "No simulation",
    molecule: "Molecule: {molecule}",
    createdAt: "Submitted at: {time}",
    startedAt: "Started at: {time}",
    endedAt: "Ended at: {time}",
    empty: {
      title: "You haven't performed a dynamic, yet...",
      description:
        "Maybe it's your first login, or you just haven't wanted to run anything yet. Anyway, you can head to New Simulation page on the menu when you want to start a new simulation."
    },
    downloads: {
      commands: "Commands",
      figures: "Figure Graphics",
      log: "GROMACS Log",
      results: "Results",
      mdp: "Download MDP Files",
      title: "Downloads"
    },
    errors: {
      hm5ka: "Error: This molecule has more than 10000 atoms.",
      command: "Errored on command: {command}"
    }
  }
} as const;
