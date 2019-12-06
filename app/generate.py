import os, errno
from datetime import datetime
from .config import Config

def generate(
    selecao_arquivo, campo_forca, modelo_agua, tipo_caixa,
    distancia_caixa, neutralizar_sistema, double, ignore,
    current_user):

    arquivo = os.path.basename(selecao_arquivo)
    (nome_arquivo, extensao) = arquivo.split('.')

    #pasta = os.path.dirname(selecao_arquivo)
    pasta = Config.UPLOAD_FOLDER + current_user.username + '/' + nome_arquivo + '/'
    try:
        os.makedirs(pasta + '/run/logs/') #criando todas as pastas
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    arquivo_gro = nome_arquivo + '.gro'
    arquivo_top = nome_arquivo + '.top'
    arquivo_box = nome_arquivo + '_box'
    arquivo_ionizado = nome_arquivo + '_charged'
    
    # a@a.com/
    CompleteFileName = "{} - {}-{}-{} [{}:{}:{}].txt".format(
            nome_arquivo, datetime.now().year, datetime.now().month,
            datetime.now().day, datetime.now().hour,
            datetime.now().minute, datetime.now().second
            )
    
    # trabalhando parametros
    comandos = open(pasta + CompleteFileName, "w")

    #print("cd "+pasta)
    #comandos.writelines("cd "+pasta+"\n\n\n\n")

    os.chdir(pasta)          ## Estgabelece o diretório de trabalho

    # Montagem do comando gmx pdb2gmx com parametros para geracao da topologia a partir da estrutura PDB selecionada, campos de forca e modelo de agua
    gmx = '/usr/local/gromacs/bin/gmx_d' if double else '/usr/local/gromacs/bin/gmx'
    comando = 'pdb2gmx'
    parametro1 = '-f'
    parametro2 = arquivo
    parametro3 = '-o'
    parametro4 = arquivo_gro
    parametro5 = '-p'
    parametro6 = arquivo_top
    parametro7 = '-ff'
    parametro8 = campo_forca
    parametro9 = '-water'
    parametro10 = modelo_agua
    parametro11 = '-ignh -missing' #para ignorar hidrogenios e atomos faltando

    comandos.write('#topology\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' \
    + parametro7 + ' ' + parametro8 + ' ' + parametro9 + ' ' + parametro10 \
    + (' ' + parametro11 if ignore else ''))
    comandos.write('\n\n')
    #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9 + ' ' + parametro10)
    #r=subprocess.Popen([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7, parametro8,parametro9, parametro10])


    # Montagem do comando gmx editconf com parametros para geracao da caixa
    # gmx editconf -f pfOxoacyl.gro -c -d 1.0 -bt cubic -o
    comando = 'editconf'
    parametro1 = '-f'
    parametro2 = arquivo_gro
    parametro3 = '-c'
    parametro4 = '-d'
    parametro5 = str(distancia_caixa)
    parametro6 = '-bt'
    parametro7 = tipo_caixa
    parametro8 = '-o'
    
    #comandos.write('#edit\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' +parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8)
    comandos.write('\n\n')
    #s=subprocess.Popen([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7, parametro8])


    # Montagem do comando gmx solvate  com parametros para solvatacao da proteina
    # gmx solvate -cp out.gro -cs -p pfOxoacyl.top -o pfOxoacyl_box
    comando = 'solvate'
    parametro1 = '-cp'
    parametro2 = 'out.gro'          ## esse arquivo ficou padronizado e estático, é a saída do comando editconf
    parametro3 = '-cs'
    parametro4 = '-p'
    parametro5 =  arquivo_top
    parametro6 = '-o'
    parametro7 = arquivo_box

    comandos.write('#solvate\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7)
    comandos.write('\n\n')
    #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7)
    #t=subprocess.Popen([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7])

    # Montagem do comando gmx grompp para precompilar e ver se o sistema esta carregado
    # grompp -f PME_em.mdp -c pfHGPRT_box.gro -p pfHGPRT.top -o pfHGPRT_charged
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'ions.mdp'        ## este arquivo ficará estático por hora.
    parametro3 = '-c'
    parametro4 = arquivo_box+'.gro'
    parametro5 = '-p'
    parametro6 = arquivo_top
    parametro7 ='-o'
    parametro8 = arquivo_ionizado
    parametro9 = '-maxwarn 2'
    comandos.write('#ions\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9)
    comandos.write('\n\n')
    #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8)
    #u=subprocess.check_output([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7,parametro8])

    if neutralizar_sistema: # se for True
    # Montagem do comando gmx genion para neutralizar o sistema
    # gmx genion -s pfOxoacyl_apo_charged.tpr -o pfOxoacyl_apo_charged -p pfOxoacyl_apo.top -neutral
        resposta = 'echo "SOL"'
        pipe = '|'
        comando = 'genion'
        parametro1 = '-s'
        parametro2 = arquivo_ionizado+'.tpr'
        parametro3 = '-o'
        parametro4 = arquivo_ionizado
        parametro5 = '-p'
        parametro6 = arquivo_top
        parametro7 = '-neutral'
        comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6+ ' ' + parametro7)
        #comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6+ ' ' + parametro7)
        comandos.write('\n\n')
        #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6+ ' ' + parametro7)
        #x = subprocess.Popen([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6]) ### Esse comando foi substituido pelo abaixo
        #ion = pexpect.spawnu(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6+ ' ' + parametro7)
        #ion.logfile = sys.stdout
        #time.sleep(5)
        #ion.expect(":")
        #ion.sendline("13" + "\r" )

        # pyatspi.Registry.generateKeyboardEvent(10, None, pyatspi.KEY_PRESSRELEASE)  ### Esses comandos foram uma tentativa de simular o pressionamento de teclas mas a opção acima se mostrou mais eficiente
        # pyatspi.Registry.generateKeyboardEvent(10, None, pyatspi.KEY_PRESSRELEASE)
        # pyatspi.Registry.generateKeyboardEvent(36, None, pyatspi.KEY_PRESSRELEASE)
        # Montagem do comando gmx grompp para precompilar e ver se o sistema esta carregado
        # grompp -f PME_em.mdp -c pfHGPRT_box.gro -p pfHGPRT.top -o pfHGPRT_charged

        # Montagem do comando gmx grompp para repetir a pre-compilacao caso seja selecionada a opcao de neutralizar o sistema
        # grompp -f PME_em.mdp -c pfHGPRT_box.gro -p pfHGPRT.top -o pfHGPRT_charged
        comando = 'grompp'
        parametro1 = '-f'
        parametro2 = 'PME_em.mdp'  ## este arquivo ficará estático por hora.
        parametro3 = '-c'
        parametro4 = arquivo_ionizado + '.gro'
        parametro5 = '-p'
        parametro6 = arquivo_top
        parametro7 = '-o'
        parametro8 = arquivo_ionizado
        parametro9 = '-maxwarn 2'
        comandos.write('#minimizationsteepdesc\n\n')
        comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9)
        comandos.write('\n\n')
        #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8)
        # t=subprocess.check_output([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7,parametro8])

        # Montagem do comando gmx mdrun para executar a dinamica de minimizacao
        # #mdrun -v -s pfHGPRT_charged.tpr -deffnm pfHGPRT_sd_em
        arquivo_minimizado = nome_arquivo+'_sd_em'
        comando = 'mdrun'
        parametro1 = '-v'
        parametro2 = '-s'
        parametro3 =  arquivo_ionizado+'.tpr'
        parametro4 = '-deffnm'
        parametro5 = arquivo_minimizado
        comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
        comandos.write('\n\n')
        #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
        # u=subprocess.check_output([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5])

        #Montagem do comando energySD para criar grafico Steepest Decent
        #gmx energy -f em.edr -o potential.xvg
        prompt = 'echo "10 0"'
        comando = 'energy'
        parametro1 = '-f'
        arquivo_edr = arquivo_minimizado + '.edr'
        parametro2 = '-o'
        nome_grafico = nome_arquivo+'_potentialsd'
        arquivo_xvg = nome_grafico + '.xvg'
        #comandos.write('#energysd\n\n')
        comandos.writelines('{} | {} {} {} {} {} {}'.format(prompt, gmx, comando, parametro1,
            arquivo_edr, parametro2, arquivo_xvg))
        comandos.write('\n\n')

        #Montagem do comando GRACE para converter gráfico SD em Imagem
        #grace -nxy potentialsd.xvg -hdevice PNG -hardcopy -printfile potentialsd.png
        comando = 'grace'
        parametro1 = '-nxy'
        #arquivo_xvg = arquivo_xvg
        parametro2 = '-hdevice'
        tipo_img = 'PNG'
        parametro3 = '-hardcopy'
        parametro4 = '-printfile'
        nome_imagem = '../../'+ nome_grafico + '.' + tipo_img
        comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, arquivo_xvg,
            parametro2, tipo_img, parametro3, parametro4, nome_imagem))
        comandos.write('\n\n')

    # Montagem do comando gmx grompp para precompilar a dinamica de minimizacao cg
    # grompp -f PME_cg_em.mdp -c pfHGPRT_sd_em.gro -p pfHGPRT.top -o pfHGPRT_cg_em
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'PME_cg_em.mdp'
    parametro3 = '-c'
    parametro4 = nome_arquivo+'_sd_em.gro'
    parametro5 = '-p'
    parametro6 = arquivo_top
    parametro7 = '-o'
    parametro8 = nome_arquivo+'_cg_em'
    parametro9 = '-maxwarn 2'
    comandos.write('#minimizationconjgrad\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5+ ' ' + parametro6+ ' ' + parametro7+ ' ' + parametro8 + ' ' + parametro9)
    comandos.write('\n\n')
    #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5+ ' ' + parametro6+ ' ' + parametro7+ ' ' + parametro8)
    # v=subprocess.check_output([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7, parametro8])

    # Montagem do comando gmx mdrun para executar a dinamica de minimizacao cg
    # mdrun -v -s pfHGPRT_cg_em.tpr -deffnm pfHGPRT_cg_em
    arquivo_minimizado_cg = nome_arquivo + '_cg_em'
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s'
    parametro3 = arquivo_minimizado_cg+'.tpr'
    parametro4 = '-deffnm'
    parametro5 = arquivo_minimizado_cg
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')
    #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
    # u=subprocess.check_output([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5])

    #Montagem do comando energyCG para criar grafico CG
    #gmx energy -f cg_em.edr -o potentialcg.xvg
    prompt = 'echo "10 0"'
    comando = 'energy'
    parametro1 = '-f'
    arquivo_edr = arquivo_minimizado_cg + '.edr'
    parametro2 = '-o'
    nome_grafico = nome_arquivo+'_potentialcg'
    arquivo_xvg = nome_grafico + '.xvg'
    #comandos.write('#energycg\n\n')
    comandos.writelines('{} | {} {} {} {} {} {}'.format(prompt, gmx,comando,parametro1,arquivo_edr,parametro2,arquivo_xvg))
    comandos.write('\n\n')

    #Montagem do comando GRACE para converter gráfico CG em Imagem
    #grace -nxy potentialsd.xvg -hdevice PNG -hardcopy -printfile potentialsd.png
    comando = 'grace'
    parametro1 = '-nxy'
    #arquivo_xvg = arquivo_xvg
    parametro2 = '-hdevice'
    tipo_img = 'PNG'
    parametro3 = '-hardcopy'
    parametro4 = '-printfile'
    nome_imagem = '../../'+ nome_grafico + '.' + tipo_img
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, arquivo_xvg, parametro2,
    tipo_img, parametro3, parametro4, nome_imagem))
    comandos.write('\n\n')

    #Montagem do comando gmx grompp para precompilar a primeira etapa do equilibrio
    # grompp -f nvt.mdp -c MjTXII_cg_em.gro -r MjTXII_cg_em.gro -p MjTXII.top -o MjTXII_nvt.tpr
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'nvt.mdp'
    parametro3 = '-c'
    parametro4 = nome_arquivo + '_cg_em.gro'
    parametro5 = '-r'
    parametro6 = parametro4
    parametro7 = '-p'
    parametro8 = arquivo_top
    parametro9 = '-o'
    parametro10 = nome_arquivo + '_nvt.tpr'
    parametro11 = '-maxwarn 2'
    comandos.write('#equilibrationnvt\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' \
    + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9 + ' ' + parametro10 + ' ' + parametro11)
    comandos.write('\n\n')

    #Montagem do comando gmx mdrun para executar a primeira etapa do equilibrio
    # mdrun -v -s MjTXII_nvt.tpr -deffnm MjTXII_nvt
    arquivo_nvt = nome_arquivo + '_nvt'
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s'
    parametro3 = arquivo_nvt + '.tpr'
    parametro4 = '-deffnm'
    parametro5 = arquivo_nvt
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #Montagem do comando energy para criar do equilibrio nvt
    prompt = 'echo "16 0"'
    comando = 'energy'
    parametro1 = '-f'
    arquivo_edr = arquivo_nvt + '.edr'
    parametro2 = '-o'
    nome_grafico = nome_arquivo+'_temperature_nvt'
    arquivo_xvg = nome_grafico + '.xvg'
    #comandos.write('#energynvt\n\n')
    comandos.writelines('{} | {} {} {} {} {} {}'.format(prompt, gmx, comando, parametro1,
        arquivo_edr, parametro2, arquivo_xvg))
    comandos.write('\n\n')

    #Montagem do comando GRACE para converter gráfico NVT em Imagem
    #grace -nxy temperature_nvt.xvg -hdevice PNG -hardcopy -printfile temperature_nvt.png
    comando = 'grace'
    parametro1 = '-nxy'
    #arquivo_xvg = arquivo_xvg
    parametro2 = '-hdevice'
    tipo_img = 'PNG'
    parametro3 = '-hardcopy'
    parametro4 = '-printfile'
    nome_imagem = '../../'+ nome_grafico + '.' + tipo_img
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, arquivo_xvg, parametro2,
    tipo_img, parametro3, parametro4, nome_imagem))
    comandos.write('\n\n')

    #Montagem do comando gmx grompp para precompilar a segunda etapa do equilibrio
    # grompp -f npt.mdp -c MjTXII_nvt.gro -r MjTXII_nvt.gro -p MjTXII.top -o MjTXII_npt.tpr
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'npt.mdp'
    parametro3 = '-c'
    parametro4 = nome_arquivo + '_nvt.gro'
    parametro5 = '-r'
    parametro6 = parametro4
    parametro7 = '-p'
    parametro8 = arquivo_top
    parametro9 = '-o'
    parametro10 = nome_arquivo + '_npt.tpr'
    parametro11 = '-maxwarn 2'
    comandos.write('#equilibrationnpt\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' \
    + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9 + ' ' + parametro10 + ' ' + parametro11)
    comandos.write('\n\n')

    #Montagem do comando gmx mdrun para executar a segunda etapa do equilibrio
    # mdrun -v -s MjTXII_npt.tpr -deffnm MjTXII_npt
    arquivo_npt = nome_arquivo + '_npt'
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s'
    parametro3 = arquivo_npt + '.tpr'
    parametro4 = '-deffnm'
    parametro5 = arquivo_npt
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #Montagem do comando energy para criar grafico do equilibrio npt
    prompt = 'echo "16 0"'
    comando = 'energy'
    parametro1 = '-f'
    arquivo_edr = arquivo_npt + '.edr'
    parametro2 = '-o'
    nome_grafico = nome_arquivo+'_temperature_npt'
    arquivo_xvg = nome_grafico + '.xvg'
    #comandos.write('#energynpt\n\n')
    comandos.writelines('{} | {} {} {} {} {} {}'.format(prompt, gmx, comando, parametro1,
        arquivo_edr, parametro2, arquivo_xvg))
    comandos.write('\n\n')

    #Montagem do comando GRACE para converter gráfico NPT em Imagem
    #grace -nxy temperature_nvt.xvg -hdevice PNG -hardcopy -printfile temperature_nvt.png
    comando = 'grace'
    parametro1 = '-nxy'
    #arquivo_xvg = arquivo_xvg
    parametro2 = '-hdevice'
    tipo_img = 'PNG'
    parametro3 = '-hardcopy'
    parametro4 = '-printfile'
    nome_imagem = '../../'+ nome_grafico + '.' + tipo_img
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, arquivo_xvg, parametro2,
    tipo_img, parametro3, parametro4, nome_imagem))
    comandos.write('\n\n')

    # Montagem do comando gmx grompp para precompilar a dinamica de position restraints VERSÃO 2
    # grompp -f md_pr.mdp -c MjTXII_npt.gro -p MjTXII.top -o MjTXII_pr
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'md_pr.mdp'
    parametro3 = '-c'
    parametro4 = nome_arquivo + '_npt.gro'
    parametro5 = '-p'
    parametro6 = arquivo_top
    parametro7 = '-o'
    parametro8 = nome_arquivo + '_pr'
    parametro9 = '-maxwarn 2'
    comandos.write('#productionmd\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9)
    comandos.write('\n\n')
    #print(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8)
    # v=subprocess.check_output([gmx, comando, parametro1, parametro2, parametro3, parametro4, parametro5, parametro6, parametro7, parametro8])


    # Montagem do comando gmx mdrun para executar a dinamica de position restraints
    # mdrun -v -s MjTXII_pr.tpr -deffnm MjTXII_pr
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s'
    parametro3 = nome_arquivo + '_pr.tpr'
    parametro4 = '-deffnm'
    parametro5 = nome_arquivo + '_pr'
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')
    

    # Montagem do comando conversao de trajetoria 
    # echo "1 0" | gmx_d trjconv -s 2jof_pr.tpr -f 2jof_pr.xtc -o 2jof_pr_PBC.xtc -pbc mol -center
    prompt = 'echo "1 0"'
    comando = 'trjconv'
    parametro1 = '-s'
    parametro2 = nome_arquivo + '_pr.tpr'
    parametro3 = '-f'
    parametro4 = nome_arquivo + '_pr.xtc'
    parametro5 = '-o'
    parametro6 = nome_arquivo + '_pr_PBC.xtc'
    parametro7 = '-pbc'
    parametro8 = 'mol'
    parametro9 = '-center'
    comandos.writelines('{} | {} {} {} {} {} {} {} {} {} {} {}'.format(prompt,gmx,comando, parametro1, parametro2, parametro3, 
    parametro4, parametro5, parametro6, parametro7, parametro8, parametro9))
    comandos.write('\n\n')

    #fim trjcon

    # Montagem do comando gmx rms da producao
    # echo "4 4" | gmx_d rms -s 2jof_pr.tpr -f 2jof_pr_PBC.xtc -o 2jof_rmsd.xvg -tu ns
    prompt ='echo "4 4"'
    comando = 'rms'
    parametro1 = '-s'
    parametro2 = nome_arquivo + '_pr.tpr'
    parametro3 = '-f'
    parametro4 = nome_arquivo + '_pr_PBC.xtc'
    parametro5 = '-o'
    parametro6 = nome_arquivo + '_rmsd_prod.xvg'
    parametro7 = '-tu'
    parametro8 = 'ns'
    comandos.writelines('{} | {} {} {} {} {} {} {} {} {} {}'.format(prompt,gmx,comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7,parametro8))
    comandos.write('\n\n')
    #fim rms

    #Montagem do comando grace
    # grace -nxy 2jof_rmsd.xvg -hdevice PNG -hardcopy -printfile ../../2jof_rmsd.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_rmsd_prod.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_rmsd_prod.PNG'
       
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')


 # Montagem do comando gmx rms da estrutura de cristal
    # echo "4 4" | gmx_d rms -s 2jof_charged -f 2jof_pr_PBC.xtc -o 2jof_rmsd_xtal.xvg -tu ns
    prompt ='echo "4 4"'
    comando = 'rms'
    parametro1 = '-s'
    parametro2 = nome_arquivo + '_charged.tpr'
    parametro3 = '-f'
    parametro4 = nome_arquivo + '_pr_PBC.xtc'
    parametro5 = '-o'
    parametro6 = nome_arquivo + '_rmsd_cris.xvg'
    parametro7 = '-tu'
    parametro8 = 'ns'
    comandos.writelines('{} | {} {} {} {} {} {} {} {} {} {}'.format(prompt,gmx,comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7,parametro8))
    comandos.write('\n\n')
    #fim rms

    #Montagem do comando grace cristal 
    # grace -nxy 2jof_rmsd.xvg, 2jof_rmsd_xtal.xvg -hdevice PNG -hardcopy -printfile ../../2jof_rmsd_xtal.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_rmsd_cris.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_rmsd_cris.PNG'
       
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')


    #Montagem do comando grace producao+cristal 
    # grace -nxy 2jof_rmsd.xvg, 2jof_rmsd_xtal.xvg -hdevice PNG -hardcopy -printfile ../../2jof_rmsd_xtal.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_rmsd_prod.xvg ' + nome_arquivo +'_rmsd_cris.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_rmsd_prod_cris.PNG'
       
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')


    #Montagem do comando gyrate 
    # gmx_d gyrate -s 2jof_pr.tpr -f 2jof_pr_PBC.xtc -o 2jof_gyrate.xvg
    prompt = 'echo "1"'
    comando = 'gyrate'
    parametro1 = '-s'
    parametro2 = nome_arquivo + '_pr.tpr'
    parametro3 = '-f'
    parametro4 = nome_arquivo + '_pr_PBC.xtc'
    parametro5 = '-o'
    parametro6 = nome_arquivo + '_gyrate.xvg'
           
    comandos.writelines('{} | {} {} {} {} {} {} {} {}'.format(prompt,gmx,comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6))
    comandos.write('\n\n')

    #Montagem do comando grace producao+cristal 
    # grace -nxy 2jof_gyrate.xvg -hdevice PNG -hardcopy -printfile ../../2jof_gyrate.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_gyrate.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_gyrate.PNG'
       
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')


    #Montagem do comando gyrate 
    # echo "1" | gmx_d rmsf -s 2jof_pr.tpr -f 2jof_pr_PBC.xtc -o 2jof_rmsf_residue.xvg -res
    prompt = 'echo "1"'
    comando = 'rmsf'
    parametro1 = '-s'
    parametro2 = nome_arquivo + '_pr.tpr'
    parametro3 = '-f'
    parametro4 = nome_arquivo + '_pr_PBC.xtc'
    parametro5 = '-o'
    parametro6 = nome_arquivo + '_rmsf_residue.xvg'
    parametro7 = '-res'
           
    comandos.writelines('{} | {} {} {} {} {} {} {} {} {}'.format(prompt,gmx,comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')

    #Montagem do comando grace producao+cristal 
    # grace -nxy 2jof_rmsf_residue.xvg -hdevice PNG -hardcopy -printfile ../../2jof_rmsf_residue.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_rmsf_residue.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_rmsf_residue.PNG'
       
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')


    


#Montagem do comando gyrate 
    # echo "1" | gmx_d sasa -s 2jof_pr.tpr -f 2jof_pr_PBC.xtc -o 2jof_solvent_accessible_surface.xvg -or 2jof_sas_residue.xvg
    prompt = 'echo "1"'
    comando = 'sasa'
    parametro1 = '-s'
    parametro2 = nome_arquivo + '_pr.tpr'
    parametro3 = '-f'
    parametro4 = nome_arquivo + '_pr_PBC.xtc'
    parametro5 = '-o'
    parametro6 = nome_arquivo + '_solvent_accessible_surface.xvg'
    parametro7 = '-or'
    parametro8 = nome_arquivo + '_sas_residue.xvg'
           
    comandos.writelines('{} | {} {} {} {} {} {} {} {} {} {}'.format(prompt,gmx,comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7,parametro8))
    comandos.write('\n\n')

    #Montagem do comando grace sas por total 
    # grace -nxy 2jof_solvent_accessible_surface.xvg -hdevice PNG -hardcopy -printfile ../../2jof_solvent_accessible_surface.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_solvent_accessible_surface.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_solvent_accessible_surface.PNG'
       
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')

    #Montagem do comando grace sas por residue 
    # grace -nxy 2jof_sas_residue.xvg -hdevice PNG -hardcopy -printfile ../../2jof_solvent_accessible_surface.PNG
    comando = 'grace'
    parametro1 = '-nxy'
    parametro2 = nome_arquivo + '_sas_residue.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG'
    parametro5 = '-hardcopy'
    parametro6 = '-printfile'
    parametro7 = '../../' + nome_arquivo + '_sas_residue.PNG'
    
    comandos.writelines('{} {} {} {} {} {} {} {}'.format(comando, parametro1, parametro2, parametro3, \
    parametro4,parametro5,parametro6,parametro7))
    comandos.write('\n\n')

    comandos.close()
    return CompleteFileName