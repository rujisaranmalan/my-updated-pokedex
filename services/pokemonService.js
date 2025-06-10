import { gql } from '@apollo/client'
import { initializeApollo } from '../lib/apollo-client'

// GraphQL Queries
const GET_POKEMON_BY_ID = gql`
  query GetPokemonById($id: Int!) {
    pokemon: pokemon_v2_pokemon_by_pk(id: $id) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonstats {
        base_stat
        pokemon_v2_stat {
          name
        }
      }
      pokemon_v2_pokemonabilities {
        is_hidden
        pokemon_v2_ability {
          name
        }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`

const GET_POKEMON_BY_RANGE = gql`
  query GetPokemonByRange($start: Int!, $end: Int!) {
    pokemon: pokemon_v2_pokemon(where: {id: {_gte: $start, _lte: $end}}) {
      id
      name
      pokemon_v2_pokemontypes {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`

// Region definitions with their Pokemon ranges
export const REGIONS = {
  Kanto: { start: 1, end: 151 },
  Johto: { start: 152, end: 251 },
  Hoenn: { start: 252, end: 386 },
  Sinnoh: { start: 387, end: 493 },
  Unova: { start: 494, end: 649 },
  Kalos: { start: 650, end: 721 },
  Alola: { start: 722, end: 809 },
  Galar: { start: 810, end: 898 },
  Hisui: { start: 899, end: 905 },
  Paldea: { start: 906, end: 1025 }
}

// Cache for Pokemon data
const pokemonCache = new Map()

// Official list of Gigantamax-capable Pokémon (final/adult forms only)
const GIGANTAMAX_IDS = [3, 6, 9, 12, 25, 94, 99, 131, 133, 143, 569, 809, 812, 815, 818, 823, 826, 834, 839, 841, 842, 844, 845, 849, 851, 858, 861, 869, 879, 884, 892, 893];
// Mapping of National Dex ID to Bulbapedia Gigantamax artwork
const GIGANTAMAX_IMAGES = {
  3:  'https://img.pokemondb.net/artwork/large/venusaur-gigantamax.jpg',
  6:  'https://img.pokemondb.net/artwork/large/charizard-gigantamax.jpg',
  9:  'https://img.pokemondb.net/artwork/large/blastoise-gigantamax.jpg',
  12: 'https://img.pokemondb.net/artwork/large/butterfree-gigantamax.jpg',
  25: 'https://img.pokemondb.net/artwork/large/pikachu-gigantamax.jpg',
  94: 'https://img.pokemondb.net/artwork/large/gengar-gigantamax.jpg',
  99: 'https://img.pokemondb.net/artwork/large/kingler-gigantamax.jpg',
  131:'https://img.pokemondb.net/artwork/large/lapras-gigantamax.jpg',
  133:'https://img.pokemondb.net/artwork/large/eevee-gigantamax.jpg',
  143:'https://img.pokemondb.net/artwork/large/snorlax-gigantamax.jpg',
  569:'https://img.pokemondb.net/artwork/large/garbodor-gigantamax.jpg',
  809:'https://img.pokemondb.net/artwork/large/melmetal-gigantamax.jpg',
  812:'https://img.pokemondb.net/artwork/large/rillaboom-gigantamax.jpg',
  815:'https://img.pokemondb.net/artwork/large/cinderace-gigantamax.jpg',
  818:'https://img.pokemondb.net/artwork/large/inteleon-gigantamax.jpg',
  823:'https://img.pokemondb.net/artwork/large/corviknight-gigantamax.jpg',
  826:'https://img.pokemondb.net/artwork/large/orbeetle-gigantamax.jpg',
  834:'https://img.pokemondb.net/artwork/large/drednaw-gigantamax.jpg',
  839:'https://img.pokemondb.net/artwork/large/coalossal-gigantamax.jpg',
  841:'https://img.pokemondb.net/artwork/large/flapple-gigantamax.jpg',
  842:'https://img.pokemondb.net/artwork/large/appletun-gigantamax.jpg',
  844:'https://img.pokemondb.net/artwork/large/sandaconda-gigantamax.jpg',
  845:'https://img.pokemondb.net/artwork/large/cramorant-gigantamax.jpg',
  849:'https://img.pokemondb.net/artwork/large/toxtricity-gigantamax.jpg',
  851:'https://img.pokemondb.net/artwork/large/centiskorch-gigantamax.jpg',
  858:'https://img.pokemondb.net/artwork/large/hatterene-gigantamax.jpg',
  861:'https://img.pokemondb.net/artwork/large/grimmsnarl-gigantamax.jpg',
  869:'https://img.pokemondb.net/artwork/large/alcremie-gigantamax.jpg',
  879:'https://img.pokemondb.net/artwork/large/copperajah-gigantamax.jpg',
  884:'https://img.pokemondb.net/artwork/large/duraludon-gigantamax.jpg',
  892:'https://img.pokemondb.net/artwork/large/urshifu-single-strike-gigantamax.jpg',
  893:'https://img.pokemondb.net/artwork/large/urshifu-rapid-strike-gigantamax.jpg'
};

// Transform Pokemon data to match our format
const transformPokemonData = (data) => {
  try {
    if (!data?.pokemon) return null

    const sprites = data.pokemon.pokemon_v2_pokemonsprites[0].sprites
    
    return {
      id: data.pokemon.id,
      name: {
        english: data.pokemon.name,
        japanese: '', // We'll need to fetch this separately
        chinese: '', // We'll need to fetch this separately
        french: '' // We'll need to fetch this separately
      },
      type: data.pokemon.pokemon_v2_pokemontypes.map(type => 
        type.pokemon_v2_type.name.charAt(0).toUpperCase() + type.pokemon_v2_type.name.slice(1)
      ),
      base: data.pokemon.pokemon_v2_pokemonstats.reduce((acc, stat) => {
        const statName = stat.pokemon_v2_stat.name
          .replace('special-', 'Sp. ')
          .replace('attack', 'Attack')
          .replace('defense', 'Defense')
        acc[statName] = stat.base_stat
        return acc
      }, {}),
      profile: {
        height: `${data.pokemon.height / 10} m`,
        weight: `${data.pokemon.weight / 10} kg`,
        ability: data.pokemon.pokemon_v2_pokemonabilities.map(ability => [
          ability.pokemon_v2_ability.name,
          ability.is_hidden.toString()
        ]),
        gender: '50:50' // Default value
      },
      image: {
        sprite: sprites.front_default,
        thumbnail: sprites.front_default,
        hires: sprites.other['official-artwork']?.front_default || sprites.front_default,
        shiny: sprites.front_shiny,
        shinyHires: sprites.other['official-artwork']?.front_shiny || sprites.front_shiny,
        gigantamax: GIGANTAMAX_IMAGES[data.pokemon.id] || null
      }
    }
  } catch (error) {
    console.error('Error transforming Pokemon data:', error)
    return null
  }
}

// Fetch a single Pokemon by ID
export const getPokemonById = async (id) => {
  try {
    // Check cache first
    if (pokemonCache.has(id)) {
      return pokemonCache.get(id)
    }

    const apolloClient = initializeApollo()
    const { data, error } = await apolloClient.query({
      query: GET_POKEMON_BY_ID,
      variables: { id: parseInt(id) }
    })

    if (error) {
      console.error(`GraphQL error fetching Pokemon ${id}:`, error)
      return null
    }

    const transformedPokemon = transformPokemonData(data)
    
    // Cache the transformed Pokemon
    if (transformedPokemon) {
      pokemonCache.set(id, transformedPokemon)
    }
    
    return transformedPokemon
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error)
    return null
  }
}

// Get Pokemon by region
export const getPokemonByRegion = async (region) => {
  console.log('getPokemonByRegion called with region:', region)
  try {
    const { start, end } = REGIONS[region]
    console.log('Fetching range:', start, end)
    const apolloClient = initializeApollo()
    const { data, error } = await apolloClient.query({
      query: GET_POKEMON_BY_RANGE,
      variables: { start, end }
    })

    console.log('GraphQL data:', data)
    console.log('GraphQL error:', error)

    if (error) {
      console.error(`GraphQL error fetching Pokemon for region ${region}:`, error)
      return []
    }

    if (!data || !data.pokemon) {
      console.error('No data or data.pokemon is undefined')
      return []
    }

    const result = data.pokemon.map(pokemon => {
      const sprites = pokemon.pokemon_v2_pokemonsprites[0].sprites
      return {
        id: pokemon.id,
        name: {
          english: pokemon.name,
          japanese: '',
          chinese: '',
          french: ''
        },
        type: pokemon.pokemon_v2_pokemontypes.map(type => 
          type.pokemon_v2_type.name.charAt(0).toUpperCase() + type.pokemon_v2_type.name.slice(1)
        ),
        image: {
          sprite: sprites.front_default,
          thumbnail: sprites.front_default,
          hires: sprites.other['official-artwork']?.front_default || sprites.front_default,
          shiny: sprites.front_shiny,
          shinyHires: sprites.other['official-artwork']?.front_shiny || sprites.front_shiny,
          gigantamax: GIGANTAMAX_IMAGES[pokemon.id] || null
        },
        canGigantamax: GIGANTAMAX_IDS.includes(pokemon.id),
        canDynamax: true // All Pokémon in Gen 8+ can Dynamax except a few, so default to true
      }
    })
    console.log('Transformed result:', result)
    return result
  } catch (error) {
    console.error(`Error fetching Pokemon for region ${region}:`, error)
    return []
  }
}

// Get all regions
export const getRegions = () => {
  return Object.keys(REGIONS)
}

// Get total number of Pokemon
export const getTotalPokemon = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon-species?limit=0`)
    return response.data.count
  } catch (error) {
    console.error('Error fetching total Pokemon count:', error)
    throw error
  }
}

// Get Pokemon names for a specific language
export const getPokemonNames = async (language = 'en') => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon-species?limit=1025`)
    const species = response.data.results

    const names = {}
    for (const species of species) {
      const speciesData = await axios.get(species.url)
      const nameData = speciesData.data.names.find(n => n.language.name === language)
      if (nameData) {
        names[speciesData.data.id] = nameData.name
      }
    }

    return names
  } catch (error) {
    console.error('Error fetching Pokemon names:', error)
    throw error
  }
} 