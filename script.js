document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const pokemonImage = document.getElementById('pokemon-image');
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const newPokemonButton = document.getElementById('new-pokemon');
    const messageDiv = document.getElementById('message');
    const correctCount = document.getElementById('correct');
    const attemptsCount = document.getElementById('attempts');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    // Game variables
    let currentPokemon = null;
    let correctGuesses = 0;
    let totalAttempts = 0;
    let pokemonNameInSpanish = '';

    // Initialize the game
    initGame();

    // Event listeners
    guessButton.addEventListener('click', checkGuess);
    newPokemonButton.addEventListener('click', initGame);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });

    // Functions
    async function initGame() {
        // Reset game state for new Pokémon
        pokemonImage.classList.remove('revealed');
        pokemonImage.style.filter = 'brightness(0)';
        guessInput.value = '';
        messageDiv.textContent = '';
        messageDiv.className = '';
        
        // Get random Pokémon ID (1-151 for first generation)
        const randomId = Math.floor(Math.random() * 151) + 1;
        
        try {
            // Fetch Pokémon data
            const pokemonData = await fetchPokemonData(randomId);
            currentPokemon = pokemonData;
            
            // Set Pokémon image
            pokemonImage.src = pokemonData.sprites.other['official-artwork'].front_default || 
                               pokemonData.sprites.front_default;
            
            // Fetch Spanish name (extra feature)
            const speciesData = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}/`)
                .then(res => res.json());
                
            pokemonNameInSpanish = speciesData.names.find(name => name.language.name === 'es').name;
            
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
            messageDiv.textContent = 'Error al cargar el Pokémon. Intenta de nuevo.';
            messageDiv.className = 'wrong';
        }
    }

    async function fetchPokemonData(id) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        return await response.json();
    }

    function checkGuess() {
        const userGuess = guessInput.value.trim().toLowerCase();
        
        if (!userGuess) {
            messageDiv.textContent = '¡Escribe un nombre para adivinar!';
            messageDiv.className = 'wrong';
            return;
        }
        
        if (!currentPokemon) {
            messageDiv.textContent = 'El Pokémon no está listo todavía. Espera un momento.';
            messageDiv.className = 'wrong';
            return;
        }
        
        totalAttempts++;
        attemptsCount.textContent = totalAttempts;
        
        const correctName = currentPokemon.name.toLowerCase();
        const isCorrect = userGuess === correctName || userGuess === pokemonNameInSpanish.toLowerCase();
        
        if (isCorrect) {
            // Correct guess
            correctGuesses++;
            correctCount.textContent = correctGuesses;
            
            // Reveal the Pokémon
            pokemonImage.classList.add('revealed');
            
            // Show success message
            messageDiv.textContent = `¡Correcto! Es ${pokemonNameInSpanish || currentPokemon.name}.`;
            messageDiv.className = 'correct';
            
            // Play sound if available
            if (correctSound) {
                correctSound.currentTime = 0;
                correctSound.play().catch(e => console.log('Sound playback prevented:', e));
            }
            
            // Disable input and guess button
            guessInput.disabled = true;
            guessButton.disabled = true;
        } else {
            // Wrong guess
            messageDiv.textContent = '¡Incorrecto! Intenta de nuevo.';
            messageDiv.className = 'wrong';
            
            // Play sound if available
            if (wrongSound) {
                wrongSound.currentTime = 0;
                wrongSound.play().catch(e => console.log('Sound playback prevented:', e));
            }
        }
    }
});