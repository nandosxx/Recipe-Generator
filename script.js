// Recipe database
const recipeDatabase = [
    {
        name: "Chicken Pasta",
        ingredients: ["Chicken", "Pasta", "Garlic", "Tomatoes"],
        instructions: "1. Cook pasta according to package\n2. Cook diced chicken until golden\n3. Add garlic and tomatoes\n4. Combine with pasta",
        cookTime: "30 minutes",
        category: "Pasta"
    },
    {
        name: "Simple Tomato Pasta",
        ingredients: ["Pasta", "Tomatoes", "Garlic", "Cheese"],
        instructions: "1. Cook pasta\n2. Make sauce with tomatoes and garlic\n3. Top with cheese",
        cookTime: "20 minutes",
        category: "Pasta"
    },
    {
        name: "Garlic Chicken",
        ingredients: ["Chicken", "Garlic", "Onion"],
        instructions: "1. Slice chicken\n2. Sauté garlic and onion\n3. Add chicken and cook",
        cookTime: "25 minutes",
        category: "Chicken"
    },
    {
        name: "Classic Spaghetti Bolognese",
        ingredients: ["Pasta", "Ground Beef", "Tomatoes", "Onion", "Garlic", "Carrots"],
        instructions: "1. Brown beef with onions and garlic\n2. Add tomatoes and carrots\n3. Simmer for 30 minutes\n4. Cook pasta\n5. Combine and serve",
        cookTime: "45 minutes",
        category: "Pasta"
    },
    {
        name: "Chicken Stir Fry",
        ingredients: ["Chicken", "Bell Peppers", "Onion", "Garlic"],
        instructions: "1. Cut chicken into pieces\n2. Stir fry vegetables\n3. Add chicken\n4. Season with soy sauce",
        cookTime: "20 minutes",
        category: "Chicken"
    }
];

// Set to store selected ingredients
let selectedIngredients = new Set();

function addManualIngredients() {
    const input = document.getElementById('ingredient-input');
    const ingredients = input.value.split(',').map(item => item.trim());
    
    ingredients.forEach(ingredient => {
        if (ingredient) {
            selectedIngredients.add(ingredient);
            console.log('Added:', ingredient);
        }
    });
    
    updateSelectedList();
    input.value = '';
}

function addIngredient(ingredient) {
    selectedIngredients.add(ingredient);
    console.log('Added:', ingredient);
    updateSelectedList();
}

function removeIngredient(ingredient) {
    selectedIngredients.delete(ingredient);
    console.log('Removed:', ingredient);
    updateSelectedList();
}

function updateSelectedList() {
    const selectedList = document.getElementById('selected-list');
    selectedList.innerHTML = '';
    
    selectedIngredients.forEach(ingredient => {
        const tag = document.createElement('div');
        tag.className = 'selected-tag';
        tag.innerHTML = `
            ${ingredient}
            <span class="remove-ingredient" onclick="removeIngredient('${ingredient}')">&times;</span>
        `;
        selectedList.appendChild(tag);
    });
}

function generateRecipe() {
    const recipeOutput = document.getElementById('recipe-output');
    
    if (selectedIngredients.size === 0) {
        recipeOutput.innerHTML = '<p>Please select some ingredients first!</p>';
        return;
    }

    const userIngredients = Array.from(selectedIngredients).map(ing => ing.toLowerCase());
    console.log('Looking for recipes with:', userIngredients);

    // Analyze each recipe for matches
    const analyzedRecipes = recipeDatabase.map(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase());
        const matchCount = userIngredients.filter(ing => 
            recipeIngredients.includes(ing)).length;
        const missingIngredients = recipe.ingredients.filter(ing => 
            !userIngredients.includes(ing.toLowerCase()));
        
        return {
            ...recipe,
            matchCount,
            matchPercentage: (matchCount / recipe.ingredients.length) * 100,
            missingIngredients
        };
    });

    // Categorize recipes
    const perfectMatches = analyzedRecipes.filter(recipe => recipe.matchPercentage === 100);
    const partialMatches = analyzedRecipes.filter(recipe => recipe.matchPercentage > 0 && recipe.matchPercentage < 100)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
    const noMatches = analyzedRecipes.filter(recipe => recipe.matchPercentage === 0);

    // Build HTML output with filter tabs
    let html = `
        <h3>Recipe Suggestions</h3>
        <p>Your ingredients: ${Array.from(selectedIngredients).join(', ')}</p>
        
        <div class="filter-tabs">
            <button class="filter-tab active" onclick="filterRecipes('all', event)">All Recipes</button>
            <button class="filter-tab" onclick="filterRecipes('perfect', event)">Perfect Matches (${perfectMatches.length})</button>
            <button class="filter-tab" onclick="filterRecipes('partial', event)">Partial Matches (${partialMatches.length})</button>
        </div>

        <div class="recipe-sections">
            <div class="recipe-section" data-match="perfect" ${perfectMatches.length === 0 ? 'style="display:none"' : ''}>
                <h4 class="section-title">Perfect Matches!</h4>
                ${renderRecipeSection(perfectMatches)}
            </div>

            <div class="recipe-section" data-match="partial" ${partialMatches.length === 0 ? 'style="display:none"' : ''}>
                <h4 class="section-title">Partial Matches</h4>
                ${renderRecipeSection(partialMatches)}
            </div>

            <div class="recipe-section" data-match="none" ${noMatches.length === 0 ? 'style="display:none"' : ''}>
                <h4 class="section-title">Other Possible Recipes</h4>
                ${renderRecipeSection(noMatches)}
            </div>
        </div>
    `;

    recipeOutput.innerHTML = html;
    recipeOutput.style.display = 'block';
}

function renderRecipeSection(recipes) {
    return recipes.map(recipe => `
        <div class="recipe-card">
            <h4>${recipe.name}</h4>
            <p class="match-percentage">
                <strong>Match: </strong>
                <span class="${getMatchClass(recipe.matchPercentage)}">
                    ${recipe.matchPercentage.toFixed(0)}%
                </span>
            </p>
            <p><strong>Cook Time:</strong> ${recipe.cookTime}</p>
            <p><strong>Required Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
            ${recipe.missingIngredients.length > 0 ? `
                <p class="missing-ingredients">
                    <strong>Missing Ingredients:</strong> ${recipe.missingIngredients.join(', ')}
                </p>
            ` : ''}
            <p><strong>Instructions:</strong></p>
            <pre>${recipe.instructions}</pre>
        </div>
    `).join('');
}

function getMatchClass(percentage) {
    if (percentage >= 80) return 'excellent-match';
    if (percentage >= 60) return 'good-match';
    if (percentage >= 40) return 'fair-match';
    if (percentage > 0) return 'poor-match';
    return 'no-match';
}

function filterRecipes(filter, event) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show/hide recipe sections based on filter
    document.querySelectorAll('.recipe-section').forEach(section => {
        switch(filter) {
            case 'perfect':
                section.style.display = section.dataset.match === 'perfect' ? 'block' : 'none';
                break;
            case 'partial':
                section.style.display = section.dataset.match === 'partial' ? 'block' : 'none';
                break;
            default: // 'all'
                section.style.display = section.children.length > 1 ? 'block' : 'none';
        }
    });
}