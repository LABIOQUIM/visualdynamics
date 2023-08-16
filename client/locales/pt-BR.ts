// locales/en.ts
export default {
  home: {
    title: "Início",
    callout: "Feito pela comunidade, para a comunidade.",
    slogan:
      "Uma nova abordagem em automação de dinâmica molecular com GROMACS.",
    description:
      "Bem-vindo ao novo Visual Dynamics.\nCom uma interface renovada e uma nova metodologia de geração e execução de simulações GROMACS, buscamos executar simulações com mais controle em menor tempo.",
    features: {
      "runs-on-cloud": {
        title: "Execução em nuvem ou local",
        description:
          "Dinâmicas moleculares exigem bastante poder computacional, por isso também oferecemos uma forma de execução em nuvem. Nós rodamos 3 MDs simultâneos, com 10 núcleos de CPU cada."
      },
      "open-source": {
        title: "Código Aberto",
        description:
          "Sabemos que executar um MD não é algo fácil, com isso em mente, mantemos o desenvolvimento deste software de automação em código aberto, feito pela comunidade, para a comunidade."
      }
    }
  },
  login: {
    title: "Entrar",
    errors: {
      user: {
        inactive:
          "Este usuário ainda não foi ativado. Entraremos em contato por e-mail quando a sua conta passar por nossas validações.",
        "wrong-credentials":
          "Esta combinação de nome de usuário/e-mail e senha não existe em nossos servidores.",
        deleted: "Essa conta foi desabilitada."
      }
    },
    identifier: {
      title: "E-mail ou nome de usuário",
      placeholder: "usuario@uni.edu",
      errors: {
        empty: "Não pode estar em branco"
      }
    },
    password: {
      title: "Senha",
      errors: {
        empty: "Não pode estar em branco"
      }
    },
    "lost-password": "Esqueci minha senha",
    "new-user": "Registrar"
  },
  navigation: {
    auth: {
      login: "Entrar",
      register: "Registrar",
      restore: "Tentando restaurar uma sessão",
      role: {
        admin: "Administrador",
        user: "Usuário"
      },
      logout: "Terminar Sessão"
    },
    admin: {
      title: "Administração",
      dashboard: "Painel",
      users: "Usuários",
      validation: "Validação de usuários",
      simulations: "Status de Simulações",
      settings: "Configurações"
    },
    simulations: {
      "my-simulations": "Minhas simulações",
      title: "Simulações",
      models: {
        apo: "APO",
        acpype: "Proteína + Ligante (preparado no ACPYPE)",
        prodrg: "Proteína + Ligante (preparado no PRODRG) [DEPRECIADO]"
      }
    },
    preparations: {
      title: "Preparação de ligantes",
      models: {
        acpype: "Gerador de ligante ACPYPE"
      }
    },
    system: {
      title: "Sistema",
      about: {
        title: "Sobre"
      },
      posts: {
        title: "Tutoriais, Videos e Posts"
      },
      home: {
        title: "Início"
      }
    },
    footer: {
      releaseNotes: "Sobre esta versão"
    }
  }
} as const;
