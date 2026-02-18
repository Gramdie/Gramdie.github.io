// Configuração direta do Supabase
const SUPABASE_URL = 'https://vhybulaqduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'SUA_ANONYMOUS_KEY_AQUI'; // <--- PEGUE A "Copy anonymous API key" DA SUA IMAGEM

// Inicializa o cliente (O "_" antes do nome evita conflitos)
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Seleciona os elementos da página
const title = document.getElementById('title');
const mainBtn = document.getElementById('mainBtn');
const toggleLink = document.getElementById('toggleLink');
const nickInput = document.getElementById('nick');
const passInput = document.getElementById('pass');

let isLoginMode = true;

// Função para alternar entre as telas de Login e Cadastro
toggleLink.onclick = (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    title.innerText = isLoginMode ? 'Login' : 'Criar Conta';
    mainBtn.innerText = isLoginMode ? 'Entrar' : 'Cadastrar';
    toggleLink.innerText = isLoginMode ? 'Não tem conta? Criar agora' : 'Já tem conta? Fazer Login';
};

// Lógica de Autenticação
mainBtn.onclick = async () => {
    const nick = nickInput.value.trim();
    const pass = passInput.value;

    if (!nick || !pass) {
        return alert("Por favor, preencha o Nickname e a Senha.");
    }

    // Criamos o identificador único "escondido" para o banco
    const userEmail = `${nick.toLowerCase()}@gramdie.com`;

    if (isLoginMode) {
        // Tentar ENTRAR
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: userEmail,
            password: pass
        });

        if (error) {
            alert("Erro no login: " + error.message);
        } else {
            alert("Bem-vindo de volta, " + nick + "!");
            window.location.href = '../index.html';
        }
    } else {
        // Tentar CADASTRAR
        const { data, error } = await _supabase.auth.signUp({
            email: userEmail,
            password: pass,
            options: {
                data: { display_name: nick } // Salva o nick original formatado
            }
        });

        if (error) {
            alert("Erro ao criar conta: " + error.message);
        } else {
            alert("Conta criada! Agora você já pode fazer login.");
            // Volta para o modo login automaticamente
            toggleLink.click();
        }
    }
};
