// Dados do personagem
var nome = "Koichi";
var vida = 10;
var ouro = 0;
var arma = 10;
var habilidadesList = [];

// Função para salvar imagem no localStorage
function salvarImagemLocalStorage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("Nenhum arquivo selecionado");
            return;
        }
        
        // Verificar tamanho (max 1MB para garantir espaço)
        if (file.size > 1024 * 1024) {
            alert("⚠️ Imagem muito grande! Use imagens de até 1MB.");
            reject("Imagem muito grande");
            return;
        }
        
        // Verificar tipo
        if (!file.type.startsWith('image/')) {
            alert("⚠️ Por favor, selecione um arquivo de imagem válido (PNG, JPG, GIF).");
            reject("Tipo de arquivo inválido");
            return;
        }
        
        // Mostrar loading
        mostrarLoading(true);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Salvar no localStorage
                localStorage.setItem('avatar_usuario', e.target.result);
                localStorage.setItem('avatar_nome', file.name);
                localStorage.setItem('avatar_data', new Date().toISOString());
                
                // Atualizar imagem na tela
                const imgElement = document.querySelector('#icone img');
                if (imgElement) {
                    imgElement.src = e.target.result;
                }
                
                mostrarLoading(false);
                alert("✅ Avatar atualizado com sucesso!");
                resolve(e.target.result);
            } catch (error) {
                mostrarLoading(false);
                if (error.name === 'QuotaExceededError') {
                    alert("⚠️ Imagem muito grande para o localStorage! Use imagens menores (máx. 500KB).");
                } else {
                    alert("❌ Erro ao salvar imagem. Tente novamente.");
                }
                reject(error);
            }
        };
        reader.onerror = function() {
            mostrarLoading(false);
            alert("❌ Erro ao ler o arquivo. Tente novamente.");
            reject("Erro na leitura do arquivo");
        };
        reader.readAsDataURL(file);
    });
}

// Função para mostrar loading
function mostrarLoading(show) {
    const btnUpload = document.querySelector('.upload-label');
    if (btnUpload) {
        if (show) {
            const originalText = btnUpload.innerHTML;
            btnUpload.innerHTML = '<span class="loading"></span> Carregando...';
            btnUpload.disabled = true;
            btnUpload.dataset.originalText = originalText;
        } else {
            btnUpload.innerHTML = btnUpload.dataset.originalText || '📸 Alterar Avatar';
            btnUpload.disabled = false;
        }
    }
}

// Função para carregar avatar salvo
function carregarAvatarSalvo() {
    const avatarSalvo = localStorage.getItem('avatar_usuario');
    if (avatarSalvo) {
        const imgElement = document.querySelector('#icone img');
        if (imgElement) {
            imgElement.src = avatarSalvo;
        }
    }
}

// Função para resetar avatar
function resetarAvatar() {
    if (confirm("Tem certeza que deseja resetar o avatar para o padrão?\n\nIsso removerá a imagem personalizada.")) {
        localStorage.removeItem('avatar_usuario');
        localStorage.removeItem('avatar_nome');
        localStorage.removeItem('avatar_data');
        
        const imgElement = document.querySelector('#icone img');
        if (imgElement) {
            imgElement.src = "images/Koichi.png";
            imgElement.onerror = function() {
                this.src = "https://via.placeholder.com/200x200?text=Koichi";
            };
        }
        alert("✅ Avatar resetado com sucesso!");
    }
}

// Função para mostrar estatísticas do avatar
function mostrarInfoAvatar() {
    const nomeAvatar = localStorage.getItem('avatar_nome');
    const dataAvatar = localStorage.getItem('avatar_data');
    
    if (nomeAvatar && dataAvatar) {
        const data = new Date(dataAvatar);
        console.log(`Avatar personalizado: ${nomeAvatar} (${data.toLocaleDateString()})`);
    }
}

// Função para mostrar o personagem
function mostrarPersonagem() {
    document.getElementById("ficha").innerHTML = `
    <div id="personagem">
        <div id="icone">
            <img src="images/Koichi.png" id="icone-img" alt="Koichi" onerror="this.src='https://via.placeholder.com/200x200?text=Koichi'">
        </div>
        <div id="info">
            <h1>📊 Atributos</h1>
            <div class="atributosCadaInfo">
                <h3>💫 ${nome}</h3>
            </div>
            <div class="atributosCadaInfo">
                <p>❤️ Vida: ${vida}</p>
            </div>
            <div class="atributosCadaInfo">
                <p>🪙 Ouro: ${ouro}</p>
            </div>
            <div class="atributosCadaInfo">
                <p>⚔️ Arma: ${arma}</p>
            </div>
            <div class="atributosCadaInfo">
                <div class="upload-container">
                    <label for="uploadImagem" class="upload-label">📸 Alterar Avatar</label>
                    <input type="file" id="uploadImagem" accept="image/jpeg,image/png,image/gif,image/webp" style="display: none;">
                </div>
                <button type="button" id="resetAvatar">🔄 Resetar Avatar</button>
            </div>
            <button type="button" id="btnVida">➕ Adicionar Vida</button>
            <button type="button" id="btnOuro">💰 Adicionar Ouro</button>
            <button type="button" id="btnArma">⚔️ Melhorar Arma</button>
        </div>
    </div>
    <div id="listaHabilidades"></div>
    `;
    
    // Adicionar eventos após recriar os elementos
    const btnVida = document.getElementById("btnVida");
    const btnOuro = document.getElementById("btnOuro");
    const btnArma = document.getElementById("btnArma");
    const uploadInput = document.getElementById("uploadImagem");
    const resetBtn = document.getElementById("resetAvatar");
    
    if (btnVida) btnVida.addEventListener("click", addVida);
    if (btnOuro) btnOuro.addEventListener("click", addOuro);
    if (btnArma) btnArma.addEventListener("click", addArma);
    
    if (uploadInput) {
        uploadInput.addEventListener("change", function(e) {
            if (e.target.files && e.target.files[0]) {
                salvarImagemLocalStorage(e.target.files[0]);
            }
        });
    }
    
    if (resetBtn) resetBtn.addEventListener("click", resetarAvatar);
    
    // Carregar avatar salvo
    carregarAvatarSalvo();
    mostrarInfoAvatar();
    
    // Mostrar habilidades salvas
    mostrarHabilidades();
}

// Função para mostrar habilidades na lista
function mostrarHabilidades() {
    const listaDiv = document.getElementById("listaHabilidades");
    if (!listaDiv) return;
    
    if (habilidadesList.length === 0) {
        listaDiv.innerHTML = '<div class="item-habilidade" style="color: #999; text-align: center;">Nenhuma habilidade adicionada ainda</div>';
        return;
    }
    
    listaDiv.innerHTML = "<h3 style='margin-bottom: 10px;'>📋 Habilidades Adquiridas:</h3>";
    habilidadesList.forEach((item, index) => {
        listaDiv.innerHTML += `
            <div class="item-habilidade">
                <strong>${item.titulo}:</strong> ${item.valor}
            </div>
        `;
    });
}

// Função para adicionar habilidade
function adicionarHabilidade(titulo, valor) {
    habilidadesList.push({ titulo: titulo, valor: valor });
    mostrarHabilidades();
    
    // Feedback visual
    const mensagem = document.createElement('div');
    mensagem.textContent = `✓ ${titulo} adicionado: ${valor}`;
    mensagem.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(mensagem);
    setTimeout(() => mensagem.remove(), 2000);
}

// Função para adicionar vida (CORRIGIDA)
function addVida() {
    if (vida >= 1000) {
        alert("⚠️ LIMITE MÁXIMO DE VIDA ATINGIDO (1000)");
        return;
    }
    
    vida++;
    
    if (vida > 1000) {
        vida = 1000;
        alert("⚠️ Limite de vida atingido: 1000");
    }
    
    mostrarPersonagem();
}

// Função para adicionar ouro (CORRIGIDA)
function addOuro() {
    var quantouro = confirm("Deseja adicionar 1 ouro ou valor personalizado?\n\nOK = +1 ouro\nCancelar = valor personalizado");
    
    if (quantouro) {
        ouro++;
    } else {
        var quantidade = prompt("Digite a quantidade de ouro que deseja adicionar:");
        
        if (quantidade !== null && quantidade !== "") {
            var quantidadeNum = Number(quantidade);
            
            if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
                alert("❌ Por favor, digite um número válido maior que zero!");
                return;
            }
            
            ouro += quantidadeNum;
            
            if (ouro > 999999) {
                ouro = 999999;
                alert("⚠️ Limite máximo de ouro atingido (999.999)");
            }
        }
    }
    
    mostrarPersonagem();
}

// Função para adicionar arma (CORRIGIDA)
function addArma() {
    arma++;
    mostrarPersonagem();
}

// Inicializar o personagem
mostrarPersonagem();

// Salvar habilidades no localStorage (opcional)
function salvarHabilidades() {
    localStorage.setItem('habilidades_personagem', JSON.stringify(habilidadesList));
}

function carregarHabilidades() {
    const saved = localStorage.getItem('habilidades_personagem');
    if (saved) {
        habilidadesList = JSON.parse(saved);
        mostrarHabilidades();
    }
}

// Carregar habilidades salvas ao iniciar
carregarHabilidades();

// Eventos dos formulários quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function() {
    
    // Formulário de Armas
    const formArmas = document.getElementById("formArmas");
    if (formArmas) {
        formArmas.addEventListener("submit", function(e) {
            e.preventDefault();
            const armaSelecionada = document.getElementById("selecaoArmas").value;
            const poderSelecionado = document.getElementById("poderes").value;
            adicionarHabilidade("⚔️ Arma", armaSelecionada);
            adicionarHabilidade("✨ Poder", poderSelecionado);
            salvarHabilidades();
        });
    }
    
    // Formulário de Categoria
    const formCategoria = document.getElementById("formCategoria");
    if (formCategoria) {
        formCategoria.addEventListener("submit", function(e) {
            e.preventDefault();
            const categoria = document.getElementById("categorias").value;
            adicionarHabilidade("🏷️ Categoria", categoria);
            salvarHabilidades();
        });
    }
    
    // Formulário Habilidade 1
    const formHab1 = document.getElementById("formHabilidade1");
    if (formHab1) {
        formHab1.addEventListener("submit", function(e) {
            e.preventDefault();
            const input = document.getElementById("hab1Input");
            const valor = input.value.trim();
            if (valor) {
                adicionarHabilidade("🔧 Habilidade 1", valor);
                input.value = "";
                salvarHabilidades();
            } else {
                alert("⚠️ Digite uma habilidade válida!");
            }
        });
    }
    
    // Formulário Habilidade 2
    const formHab2 = document.getElementById("formHabilidade2");
    if (formHab2) {
        formHab2.addEventListener("submit", function(e) {
            e.preventDefault();
            const input = document.getElementById("hab2Input");
            const valor = input.value.trim();
            if (valor) {
                adicionarHabilidade("🔮 Habilidade 2", valor);
                input.value = "";
                salvarHabilidades();
            } else {
                alert("⚠️ Digite uma habilidade válida!");
            }
        });
    }
    
    // Formulário Habilidade 3
    const formHab3 = document.getElementById("formHabilidade3");
    if (formHab3) {
        formHab3.addEventListener("submit", function(e) {
            e.preventDefault();
            const input = document.getElementById("hab3Input");
            const valor = input.value.trim();
            if (valor) {
                adicionarHabilidade("⚡ Habilidade 3", valor);
                input.value = "";
                salvarHabilidades();
            } else {
                alert("⚠️ Digite uma habilidade válida!");
            }
        });
    }
});

// Salvar atributos periodicamente (opcional)
function salvarAtributos() {
    const atributos = {
        vida: vida,
        ouro: ouro,
        arma: arma
    };
    localStorage.setItem('atributos_personagem', JSON.stringify(atributos));
}

function carregarAtributos() {
    const saved = localStorage.getItem('atributos_personagem');
    if (saved) {
        const atributos = JSON.parse(saved);
        vida = atributos.vida;
        ouro = atributos.ouro;
        arma = atributos.arma;
        mostrarPersonagem();
    }
}

// Carregar atributos ao iniciar
carregarAtributos();

// Salvar atributos antes de fechar a página
window.addEventListener('beforeunload', function() {
    salvarAtributos();
    salvarHabilidades();
});