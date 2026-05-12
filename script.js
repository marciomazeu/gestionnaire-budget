// 1. Estado da Aplicação (GB-02)
let transactions = [];

// Seleção de Elementos do DOM
const form = document.getElementById('budget-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const transactionsList = document.getElementById('transactions-list');

const totalRevenusEl = document.getElementById('total-revenus');
const totalDepensesEl = document.getElementById('total-depenses');
const totalSoldeEl = document.getElementById('total-solde');

// 2. Função para Recalcular Totais (GB-01, GB-04)
function updateTotals() {
    const revenus = transactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + t.amount, 0);

    const depenses = transactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + t.amount, 0);

    const solde = revenus - depenses;

    totalRevenusEl.textContent = `${revenus.toFixed(2)} $`;
    totalDepensesEl.textContent = `${depenses.toFixed(2)} $`;
    totalSoldeEl.textContent = `${solde.toFixed(2)} $`;
}

// 3. Função para Renderizar a Lista (GB-02)
function renderTransactions() {
    transactionsList.innerHTML = '';

    transactions.forEach((t, index) => {
        const div = document.createElement('div');
        div.className = `transaction-item ${t.type}`;
        
        div.innerHTML = `
            <div>
                <strong>${t.description}</strong> (${t.category})
            </div>
            <div>
                <span>${t.type === 'revenu' ? '+' : '-'}${t.amount.toFixed(2)} $</span>
                <button class="btn-delete" onclick="deleteTransaction(${index})">Supprimer</button>
            </div>
        `;
        transactionsList.appendChild(div);
    });
}

// 4. Adicionar Transação (GB-03, GB-05)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const transaction = {
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: typeSelect.value,
        category: categorySelect.value
    };

    // Validação de segurança (GB-05)
    if (!transaction.description || isNaN(transaction.amount) || !transaction.type) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    transactions.push(transaction);
    updateTotals();
    renderTransactions();
    form.reset();
});

// 5. Deletar Transação com Confirmação (GB-04)
window.deleteTransaction = function(index) {
    if (confirm("Voulez-vous vraiment supprimer cette transaction ?")) {
        transactions.splice(index, 1);
        updateTotals();
        renderTransactions();
    }
};

// 6. Exportar para JSON (GB-06)
document.getElementById('download-btn').addEventListener('click', () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = "budget_export.json";
    link.click();
});

// 7. Importar de JSON (GB-07)
document.getElementById('import-btn').addEventListener('click', () => {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
        alert("Veuillez sélectionner um fichier JSON.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                transactions = importedData;
                updateTotals();
                renderTransactions();
            }
        } catch (err) {
            alert("Erreur lors de l'importation : Fichier invalide.");
        }
    };
    reader.readAsText(file);
});

// Função para carregamento inicial (Requisito 5.1 - Grille de correction)
async function loadInitialData() {
    try {
        const response = await fetch('data/data.json'); // Você pode criar um arquivo data.json com []
        if (response.ok) {
            const data = await response.json();
            transactions = data;
            renderTransactions();
            updateTotals();
            console.log("Données chargées depuis data/data.json");
        }
    } catch (error) {
        console.log("Démarrage avec un budget vide (data.json non trouvé).");
        // CT-01: Ao falhar ou não existir, inicia vazio [cite: 6]
        updateTotals(); 
    }
}

// Chamar a função ao carregar a página
window.addEventListener('DOMContentLoaded', loadInitialData);