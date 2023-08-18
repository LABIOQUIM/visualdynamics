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
  },
  register: {
    title: "Cadastrar",
    alert:
      "Ao criar um usuário, você estará automaticamente de acordo com nossos Termos de Serviço.\nEsteja ciente de que este usuário não está ativo por padrão, ele passará um período de validação e você será enviado por e-mail sobre essa validação.",
    errors: {
      user: {
        existing: "Já existe um usuário com esse e-mail ou nome de usuário."
      }
    },
    email: {
      title: "Email",
      placeholder: "usuario@uni.edu",
      errors: {
        disallowed: "Você deve usar seu email institucional",
        empty: "Não pode estar em branco",
        invalid: "Este não é um endereço de email válido"
      }
    },
    password: {
      title: "Senha",
      errors: {
        empty: "Não pode estar em branco"
      }
    },
    username: {
      title: "Nome de usuário",
      placeholder: "johndoe",
      errors: {
        empty: "Não pode estar em branco",
        invalid: "Apenas alfanumérico (a-z, A-Z, 0-9), entre 4 e 10 caracteres"
      }
    },
    name: {
      title: "Nome",
      placeholder: "John Doe",
      errors: {
        empty: "Não pode estar em branco"
      }
    }
  },
  reset: {
    alerts: {
      passwordmigration:
        "Detectamos que sua conta existe desde o Visual Dynamics v1. Antes de usar o VD novamente, por favor, redefina sua senha para concluir a migração."
    },
    "reset-form": {
      title: "Redefinir Senha",
      password: {
        title: "Nova senha",
        errors: {
          "min-length": "Sua senha antiga precisa ter ao menos 6 caracteres"
        }
      },
      errors: {
        failed:
          "Nós não conseguimos alterar sua senha. Ou este link está expirado e/ou já é utilizado ou o usuário para o qual este link foi emitido não existe."
      },
      reseted:
        "Sua senha foi redefinida. Agora você pode entrar e continuar utilizando Visual Dynamics"
    },
    "request-form": {
      title: "Solicitar Link de redefinição de senha",
      identifier: {
        title: "Nome de usuário ou e-mail",
        placeholder: "usuario@uni.edu",
        errors: {
          empty: "Este campo é obrigatório."
        }
      },
      errors: {
        "no-user":
          "Não foi possível encontrar um usuário/conta com este usuário/email",
        "sendmail-failed": "Não foi possível enviar o email."
      },
      success:
        "Enviamos um link para redefinir a senha. Ele será válido por apenas 10 minutos."
    },
    title: "Redefinir Senha"
  }
} as const;
