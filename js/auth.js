// Configurações do Supabase
const SUPABASE_URL = 'https://vhybulaqduktgwxqbzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; // <--- COLE AQUI A "anon public key"

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos da página
const title = document.getElementById('title');
const mainBtn = document.getElementById('mainBtn');
const toggleLink = document.getElementById('toggleLink');
const nickInput = document.getElementById('nick');
const passInput = document.getElementById('pass');

let isLoginMode = true;

// FUNÇÃO PARA ALTERNAR (O que não está funcionando no seu)
toggleLink.onclick = (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    title.innerText = isLoginMode ? 'Login' : 'Criar Conta';
    mainBtn.innerText = isLoginMode ? 'Entrar' : 'Cadastrar';
    toggleLink.innerText = isLoginMode ? 'Não tem conta? Criar agora' : 'Já tem conta? Fazer Login';
};

// FUNÇÃO DE CLIQUE NO BOTÃO
mainBtn.onclick = async () => {
    const nick = nickInput.value.trim();
    const pass = passInput.value;

    if (!nick || !pass) return alert("Preencha tudo!");

    // O "e-mail invisível" para o Supabase aceitar apenas Nickname
    const fakeEmail = `${nick.toLowerCase()}@gramdie.com`;

    if (isLoginMode) {
        // Lógica de Login
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: pass
        });
        if (error) alert("Erro no Login: " + error.message);
        else {
            alert("Sucesso! Bem-vindo " + nick);
            window.location.href = '../index.html';
        }
    } else {
        // Lógica de Cadastro
        const { data, error } = await _supabase.auth.signUp({
            email: fakeEmail,
            password: pass
        });
        if (error) alert("Erro no Cadastro: " + error.message);
        else alert("Conta criada! Agora clique em 'Fazer Login' para entrar.");
    }
};

