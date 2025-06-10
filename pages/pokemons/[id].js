import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { getPokemonById } from '../../services/pokemonService'
import { useState, useEffect } from 'react'

export default function Pokemon({ colors }) {
  const router = useRouter()
  const { id } = router.query
  const [pokemon, setPokemon] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!id) return

      setIsLoading(true)
      try {
        const data = await getPokemonById(id)
        setPokemon(data)
      } catch (error) {
        console.error('Error fetching Pokemon:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPokemon()
  }, [id])

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  if (!pokemon) {
    return (
      <Layout title="Pokemon Not Found">
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl">Pokemon not found</h1>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={pokemon.name.english}>
      <div className="flex flex-col items-center">
        <div className="bg-gray-200 rounded-lg p-8 max-w-2xl w-full">
          <div className="flex flex-col items-center">
            <img
              src={pokemon.image.hires}
              alt={pokemon.name.english}
              className="w-64 h-64 object-contain"
            />
            <h1 className="text-3xl font-bold mt-4">
              {pokemon.id}. {pokemon.name.english}
            </h1>
            <div className="flex gap-2 mt-2">
              {pokemon.type.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: colors[type.toLowerCase()] }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Base Stats</h2>
              <div className="space-y-2">
                {Object.entries(pokemon.base).map(([stat, value]) => (
                  <div key={stat} className="flex items-center">
                    <span className="w-24 font-medium">{stat}</span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(value / 255) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Profile</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Height:</span> {pokemon.profile.height}
                </p>
                <p>
                  <span className="font-medium">Weight:</span> {pokemon.profile.weight}
                </p>
                <p>
                  <span className="font-medium">Abilities:</span>{' '}
                  {pokemon.profile.ability
                    .map(([ability, isHidden]) =>
                      isHidden === 'true' ? `${ability} (Hidden)` : ability
                    )
                    .join(', ')}
                </p>
                <p>
                  <span className="font-medium">Gender:</span> {pokemon.profile.gender}
                </p>
              </div>
            </div>
          </div>

          {pokemon.description && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700">{pokemon.description}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps(context) {
  return {
    props: {
      colors: {
        normal: "#A8A77A",
        fire: "#EE8130",
        water: "#6390F0",
        electric: "#F7D02C",
        grass: "#7AC74C",
        ice: "#96D9D6",
        fighting: "#C22E28",
        poison: "#A33EA1",
        ground: "#E2BF65",
        flying: "#A98FF3",
        psychic: "#F95587",
        bug: "#A6B91A",
        rock: "#B6A136",
        ghost: "#735797",
        dragon: "#6F35FC",
        dark: "#705746",
        steel: "#B7B7CE",
        fairy: "#D685AD",
      },
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
} 