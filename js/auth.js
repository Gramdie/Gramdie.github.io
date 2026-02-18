const SUPABASE_URL = 'https://vhybulaqduktgwxqbzn.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJ1bGFxY2R1a3Rnd3hxYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQyOTgsImV4cCI6MjA4NzAyMDI5OH0.5obZrq54mSh1R3JzJ_lKokVVw4Yp2oostUMQLXzzR0s'; // <--- COLE A CHAVE DO SUPABASE AQUI

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const title = document.getElementById('title');
const mainBtn = document.getElementById('mainBtn');
const toggleLink = document.getElementById('toggleLink');
let isLoginMode = true;

toggleLink.onclick = () => {
    isLoginMode = !isLoginMode;
    title.innerText = isLoginMode ? 'Login' : 'Criar Conta';
    mainBtn.innerText = isLoginMode ? 'Entrar' : 'Cadastrar';
    toggleLink.innerText = isLoginMode ? 'Não tem conta? Criar agora' : 'Já tem conta? Login';
};

mainBtn.onclick = async () => {
    const nick = document.getElementById('nick').value.trim();
    const pass = document.getElementById('pass').value;

    if (!nick || !pass) return alert("Preencha Nickname e Senha!");
    
    // O sistema usa isso internamente, mas o usuário não vê
    const fakeEmail = `${nick.toLowerCase()}@gramdie.com`;

    if (isLoginMode) {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: pass
        });
        if (error) alert("Erro: " + error.message);
        else { alert("Bem-vindo, " + nick); window.location.href = '../index.html'; }
    } else {
        const { data, error } = await _supabase.auth.signUp({
            email: fakeEmail,
            password: pass,
            options: { data: { nickname: nick } }
        });
        if (error) alert("Erro: " + error.message);
        else alert("Conta criada! Agora faça login.");
    }
};
