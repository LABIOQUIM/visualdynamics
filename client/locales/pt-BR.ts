// locales/en.ts
export default {
  about: {
    acknowledgements:
      "Agradecimentos a toda a equipe responsável pelo desenvolvimento e manutenção do GROMACS e Grace/Xmgr",
    description:
      "Visual Dynamics é uma ferramenta de código aberto que acelera implementações e aprendizado na área da simulação de dinâmica molecular. Disponível gratuitamente e suportado por todos os principais navegadores, é feito em Flask e NextJS, ambos frameworks gratuitos e de código aberto para desenvolvimento web.",
    maintainers: {
      title: "Equipe de Desenvolvimento",
      active: "Ativos",
      inactive: "Anteriores"
    },
    title: "Sobre",
    work: {
      code: "Desenvolvimento de código",
      idea: "Ideia e conceito",
      manuscript: "Escrita de publicação"
    },
    publication: {
      title: "Publicações"
    }
  },
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
      "new-simulation": "Nova Simulação",
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
  "new-simulation": {
    description: {
      apo: "",
      acpype: "",
      prodrg: ""
    },
    form: {
      warnings: {
        hm5ka:
          "Moléculas com mais de 10.000 átomos não serão executadas, por favor, verifique isso antes de fazer a submissão para a fila.",
        analysis:
          "Simulações de estruturas com múltiplas cadeias funcionam mas geram análises (RMSD, RMSF, RG e SASA) improdutivas. Estamos trabalhando nesta automatização."
      },
      submit: {
        download: "Baixar lista de comandos",
        run: "Executar simulação"
      },
      "file-pdb": {
        title: "Molécula (.pdb)",
        errors: {
          "no-pdb": "Selecione um arquivo .pdb de molécula"
        }
      },
      ns: {
        title: "Tempo de Simulação",
        info: "Se sua simulação requer mais do que 5ns, por favor, entre em contato com <email>fernando.zanchi@fiocruz.br</email>"
      },
      "file-itp": {
        title: "Ligante (.itp)",
        errors: {
          "no-itp": "Selecione um arquivo .itp de ligante"
        }
      },
      "file-gro": {
        title: "Ligante (.pdb)",
        errors: {
          "no-gro": "Selecione um arquivo .pdb de ligante"
        }
      },
      "force-field": {
        title: "Campo de Força",
        placeholder: "Selecione um campo força",
        errors: {
          "no-force-field": "Selecione um campo força"
        }
      },
      "water-model": {
        title: "Modelo de água",
        placeholder: "Selecione um modelo de água",
        errors: {
          "no-water-model": "Selecione um modelo de água"
        }
      },
      "box-type": {
        title: "Tipo da Caixa",
        placeholder: "Selecione um tipo de caixa",
        errors: {
          "no-box-type": "Selecione um tipo de caixa"
        }
      },
      "box-distance": {
        title: "Distância da Caixa (nm)",
        errors: {
          "distance-doesnt-match": "Deve ser um número, decimal ou não.",
          "out-of-bounds": "Deve estar entre 0.1 e 1"
        }
      },
      neutralize: {
        title: "Neutralizar sistema"
      },
      ignore: {
        title: "Ignorar hidrogênios"
      },
      double: {
        title: "Usar precisão dupla"
      },
      run: {
        title: "Executar em nossos servidores"
      },
      options: "Opções"
    },
    title: "Nova Simulação"
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
  },
  "running-simulation": {
    title: "Sua simulação está executando",
    description: "Informações",
    abort: "Abortar",
    type: "Tipo de Simulação: {simulationType}",
    molecule: "Molécula: {moleculeName}",
    createdAt: "Gerada em: {formattedDate}",
    logs: {
      title: "Logs de execução em tempo real"
    },
    steps: {
      topology: "Definição de topologia",
      solvate: "Definindo caixa e solvatando",
      ions: "Adicionando íons",
      minimizationsteepdesc: "Min: Steep Descent",
      minimizationconjgrad: "Min: Conjugate Gradient",
      equilibrationnvt: "Restrição: NVT",
      equilibrationnpt: "Restrição: NPT",
      productionmd: "Produção: MD",
      analyzemd: "Análise: MD",
      title: "Etapas"
    },
    "not-running": {
      title: "Não há nenhuma simulação em execução",
      description:
        "Parece que você não tem nenhuma simulação em execução em nossos servidores. Comece clicando um botão abaixo."
    },
    queued: {
      title: "Você possui uma simulação na fila",
      description:
        "Sua simulação vai começar automaticamente quando um espaço de processamento for liberado"
    }
  }
} as const;
