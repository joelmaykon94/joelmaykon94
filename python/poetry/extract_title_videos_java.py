import subprocess
import json
import time
from tqdm import tqdm
import os

print("Buscando dados do canal @java... Isso pode levar algum tempo devido ao volume real de vídeos.")

# Lista para consolidar todos os vídeos encontrados nas abas corretas
todos_videos = []
urls_alvo = [
    'https://www.youtube.com/@java/videos',
    'https://www.youtube.com/@java/streams'
]

# Arquivo temporário para salvar progresso
arquivo_progresso = "progresso_videos_java.json"
videos_encontrados = set()

# Carregar progresso anterior se existir
if os.path.exists(arquivo_progresso):
    try:
        with open(arquivo_progresso, "r", encoding="utf-8") as f:
            dados_progresso = json.load(f)
            videos_encontrados = set(dados_progresso.get("videos_ids", []))
            print(f"✓ Progresso anterior carregado: {len(videos_encontrados)} vídeos já encontrados")
    except (OSError, json.JSONDecodeError):
        pass

def salvar_progresso(video_id):
    """Salva o ID do vídeo encontrado no arquivo de progresso"""
    videos_encontrados.add(video_id)
    with open(arquivo_progresso, "w", encoding="utf-8") as f:
        json.dump({"videos_ids": list(videos_encontrados)}, f)

def adicionar_video_markdown(video_info, idx):
    """Adiciona um vídeo individual ao arquivo markdown"""
    titulo = video_info.get('title', 'Sem título').replace('|', '-').replace('\n', ' ')
    url = f"https://www.youtube.com/watch?v={video_info.get('id')}"
    
    with open("todos_videos_java.md", "a", encoding="utf-8") as f:
        f.write(f"| {idx} | {titulo} | [Assistir]({url}) |\n")

def extrair_videos_pagina(url, page_num=None):
    """Extrai vídeos de uma página específica do canal"""
    comando_base = [
        'yt-dlp',
        '--dump-json',
        '--match-filter', 'original_url !*=/shorts/ & duration > 61',
        '--ignore-errors',
        '--no-playlist'
    ]
    
    # Adicionar página específica se fornecida
    if page_num is not None:
        comando_base.extend(['--playlist-start', str(page_num * 30 + 1), 
                            '--playlist-end', str((page_num + 1) * 30)])
    
    comando_base.append(url)
    
    try:
        resultado = subprocess.run(comando_base, capture_output=True, text=True, encoding='utf-8')
        
        videos_pagina = []
        if resultado.stdout.strip():
            # Dividir a saída por linhas (cada linha é um JSON de um vídeo)
            for linha in resultado.stdout.strip().split('\n'):
                if linha.strip():
                    try:
                        video_data = json.loads(linha)
                        if video_data.get('id') and video_data.get('id') not in videos_encontrados:
                            videos_pagina.append(video_data)
                            salvar_progresso(video_data['id'])
                    except json.JSONDecodeError:
                        continue
        return videos_pagina
    except Exception as e:
        print(f"Erro ao extrair página {page_num}: {e}")
        return []

# Obter número total estimado de vídeos
print("\n🔍 Estimando total de vídeos...")
comando_total = [
    'yt-dlp',
    '--flat-playlist',
    '--print', '%(title)s',
    '--match-filter', 'original_url !*=/shorts/ & duration > 61',
    '--ignore-errors',
    urls_alvo[0]
]

try:
    resultado_total = subprocess.run(comando_total, capture_output=True, text=True, encoding='utf-8')
    linhas = resultado_total.stdout.strip().split('\n')
    total_estimado = len([linha for linha in linhas if linha.strip()])
    print(f"📊 Total estimado de vídeos longos: ~{total_estimado}")
except:
    total_estimado = None
    print("⚠️ Não foi possível estimar o total exato")

# Inicializar arquivo markdown
with open("todos_videos_java.md", "w", encoding="utf-8") as f:
    f.write("# ☕ Todos os Vídeos do Canal Oficial do Java (Excluindo Shorts)\n\n")
    f.write("*Processo de coleta em andamento...*\n\n")
    f.write("| # | Título do Vídeo | Link |\n")
    f.write("| --- | :--- | :--- |\n")

# Processar cada URL alvo
for url_canal in urls_alvo:
    print(f"\n📺 Processando: {url_canal}")
    
    # Primeiro, obter a lista de vídeos (para saber quantas páginas)
    comando_lista = [
        'yt-dlp',
        '--flat-playlist',
        '--print', '%(id)s',
        '--match-filter', 'original_url !*=/shorts/ & duration > 61',
        '--ignore-errors',
        url_canal
    ]
    
    resultado_lista = subprocess.run(comando_lista, capture_output=True, text=True, encoding='utf-8')
    
    if resultado_lista.returncode != 0 or not resultado_lista.stdout.strip():
        print(f"⚠️ Nenhum vídeo encontrado em {url_canal}")
        continue
    
    video_ids = [vid_id.strip() for vid_id in resultado_lista.stdout.strip().split('\n') if vid_id.strip()]
    total_videos_secao = len(video_ids)
    
    print(f"🎬 Encontrados {total_videos_secao} vídeos/lives nesta seção")
    
    # Processar vídeos individualmente com barra de progresso
    idx_atual = len(videos_encontrados) + 1
    
    with tqdm(total=total_videos_secao, desc=f"Processando {url_canal.split('/')[-1]}", unit="video") as pbar:
        for video_id in video_ids:
            if video_id in videos_encontrados:
                pbar.update(1)
                continue
            
            # Buscar detalhes do vídeo individual
            comando_video = [
                'yt-dlp',
                '--dump-json',
                '--ignore-errors',
                f'https://www.youtube.com/watch?v={video_id}'
            ]
            
            resultado_video = subprocess.run(comando_video, capture_output=True, text=True, encoding='utf-8')
            
            if resultado_video.returncode == 0 and resultado_video.stdout.strip():
                try:
                    video_data = json.loads(resultado_video.stdout)
                    
                    # Verificar se não é Short e tem duração adequada
                    if '/shorts/' not in video_data.get('original_url', '') and video_data.get('duration', 0) > 61:
                        adicionar_video_markdown(video_data, idx_atual)
                        salvar_progresso(video_data['id'])
                        idx_atual += 1
                    
                except json.JSONDecodeError:
                    pass
            
            pbar.update(1)
            # Pequena pausa para não sobrecarregar a API
            time.sleep(0.1)

# Atualizar cabeçalho do arquivo com o total final
total_final = len(videos_encontrados)
with open("todos_videos_java.md", "r", encoding="utf-8") as f:
    conteudo = f.read()

conteudo_atualizado = conteudo.replace(
    "*Processo de coleta em andamento...*\n\n",
    f"**Total de vídeos de conteúdo longo encontrados: {total_final}**\n\n*Última atualização: {time.strftime('%d/%m/%Y %H:%M:%S')}*\n\n"
)

with open("todos_videos_java.md", "w", encoding="utf-8") as f:
    f.write(conteudo_atualizado)

print("\n✅ Processo concluído!")
print(f"📊 Total final de vídeos: {total_final}")
print("📁 Arquivo salvo: todos_videos_java.md")
print(f"💾 Progresso salvo em: {arquivo_progresso}")

# Limpar arquivo de progresso (opcional - comentar se quiser manter para próximas execuções)
# if os.path.exists(arquivo_progresso):
#     os.remove(arquivo_progresso)