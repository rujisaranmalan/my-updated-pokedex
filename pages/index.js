//Home page

/* eslint-disable @next/next/no-img-element */
//imports
import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { getPokemonByRegion, getRegions, REGIONS } from "../services/pokemonService";

export default function Home({ colors }) {
  //current region
  const [currentRegion, setCurrentRegion] = useState("Kanto");
  //array of pokemons for current region
  const [pokeArr, setPokeArr] = useState([]);
  // state of input
  const [input, setInput] = useState("");
  // search results array
  const [searchResults, setSearchResults] = useState([]);
  // filtered search results array
  const [filteredArr, setFilteredArr] = useState([]);
  const [filter, setFilter] = useState("All");
  // loading state
  const [isLoading, setIsLoading] = useState(true);
  // available regions
  const [regions] = useState(getRegions());
  // current page
  const [currentPage, setCurrentPage] = useState(0);
  const POKEMON_PER_PAGE = 20;
  // Track shiny toggles per card (by Pokémon id)
  const [shinyToggles, setShinyToggles] = useState({})
  // Track flip state per card (by Pokémon id)
  const [flipToggles, setFlipToggles] = useState({})

  // Fetch Pokemon data when region changes
  useEffect(() => {
    const fetchPokemon = async () => {
      setIsLoading(true);
      try {
        const pokemon = await getPokemonByRegion(currentRegion);
        setPokeArr(pokemon);
        setSearchResults(pokemon);
        setFilteredArr(pokemon);
        setCurrentPage(0); // Reset to first page when region changes
      } catch (error) {
        console.error('Error fetching Pokemon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, [currentRegion]);

  const handleRegionChange = (e) => {
    setCurrentRegion(e.target.value);
    setInput("");
    setFilter("All");
  };

  const handleFilterChange = (e) => {
    const selFilter = e.target.value;
    setFilter(e.target.value);
    if (selFilter === "All") {
      if (input.length === 0) {
        setFilteredArr(searchResults);
      } else {
        const filtered = searchResults.filter((pokeman) => 
          pokeman.name.english.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredArr(filtered);
      }
    } else {
      let temp = searchResults.filter((pokeman) => 
        pokeman.type.includes(selFilter)
      );
      if (input.length !== 0) {
        temp = temp.filter((pokeman) => 
          pokeman.name.english.toLowerCase().includes(input.toLowerCase())
        );
      }
      setFilteredArr(temp);
    }
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.length === 0) {
      if (filter === "All") {
        setSearchResults(pokeArr);
        setFilteredArr(pokeArr);
      } else {
        const filtered = pokeArr.filter((pokeman) => 
          pokeman.type.includes(filter)
        );
        setSearchResults(filtered);
        setFilteredArr(filtered);
      }
    } else {
      let temp = pokeArr.filter((pokeman) => 
        pokeman.name.english.toLowerCase().includes(value.toLowerCase())
      );
      if (filter !== "All") {
        temp = temp.filter((pokeman) => 
          pokeman.type.includes(filter)
        );
      }
      setSearchResults(temp);
      setFilteredArr(temp);
    }
    setCurrentPage(0); // Reset to first page when search changes
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    const totalPages = Math.ceil(filteredArr.length / POKEMON_PER_PAGE);
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate pagination
  const startIndex = currentPage * POKEMON_PER_PAGE;
  const endIndex = startIndex + POKEMON_PER_PAGE;
  const currentPokemon = filteredArr.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredArr.length / POKEMON_PER_PAGE);

  const handleShinyToggle = (id) => {
    setShinyToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }
  const handleFlipToggle = (id) => {
    setFlipToggles((prev) => {
      const newState = { ...prev, [id]: !prev[id] }
      console.log('Flip state for', id, 'is now', newState[id])
      return newState
    })
  }

  return (
    <div>
      {/* layout wrapper */}
      <Layout title={"WebPokedex"}>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 px-8">
          <select
            id="regions"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-48 p-2.5"
            value={currentRegion}
            onChange={handleRegionChange}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <input
            type="text"
            id="searchInp"
            value={input}
            onChange={handleChange}
            className="w-full sm:w-3/4 bg-gray-100 px-6 py-2 rounded border border-poke-yellow outline-none"
            placeholder="Search"
          />
        </div>
        <div className="flex px-8 sm:px-16 py-4 items-center">
          <label
            htmlFor="types"
            className="block mr-6 font-medium text-gray-900 text-lg sm:text-2xl"
          >
            Type
          </label>
          <select
            id="types"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1 sm:p-2.5"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Normal">Normal</option>
            <option value="Fire">Fire</option>
            <option value="Water">Water</option>
            <option value="Electric">Electric</option>
            <option value="Grass">Grass</option>
            <option value="Ice">Ice</option>
            <option value="Fighting">Fighting</option>
            <option value="Poison">Poison</option>
            <option value="Ground">Ground</option>
            <option value="Flying">Flying</option>
            <option value="Psychic">Psychic</option>
            <option value="Bug">Bug</option>
            <option value="Rock">Rock</option>
            <option value="Ghost">Ghost</option>
            <option value="Dragon">Dragon</option>
            <option value="Dark">Dark</option>
            <option value="Steel">Steel</option>
            <option value="Fairy">Fairy</option>
          </select>
        </div>
        {/* container */}
        <div className="flex flex-wrap justify-center mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center w-full h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredArr.length === 0 ? (
            <div className="flex justify-center items-center w-full h-64">
              <p className="text-gray-600 text-xl">No Pokémon found.</p>
            </div>
          ) : (
            currentPokemon.map((pokeman, index) => {
              const isShiny = shinyToggles[pokeman.id] || false
              const isFlipped = flipToggles[pokeman.id] || false
              const imgSrc = isShiny
                ? pokeman.image.shinyHires || pokeman.image.shiny || pokeman.image.sprite
                : pokeman.image.hires || pokeman.image.sprite
              // Placeholder for Gigantamax image (replace with real asset if available)
              const gmaxImg = pokeman.image.gigantamax || '/gigantamax-placeholder.png'
              if (pokeman.canGigantamax) {
                return (
                  <div className="flip-card m-4" key={pokeman.name.english}>
                    <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}> 
                      {/* Front of card */}
                      <div className="flip-card-front bg-gray-200 rounded p-4 flex flex-col items-center">
                        <Link href={"/pokemons/" + pokeman.id}>
                          <a>
                            <img
                              src={imgSrc}
                              alt=""
                              width={100}
                              height={100}
                              className="mb-4 h-[152px] w-[152px] sm:h-[202px] sm:w-[202px] m-6"
                              loading="lazy"
                            />
                          </a>
                        </Link>
                        <button
                          type="button"
                          className={`mb-2 px-3 py-1 rounded text-xs font-semibold ${isShiny ? 'bg-yellow-400 text-gray-900' : 'bg-gray-400 text-white'}`}
                          onClick={() => handleShinyToggle(pokeman.id)}
                        >
                          {isShiny ? 'Show Normal' : 'Show Shiny'}
                        </button>
                        <button
                          type="button"
                          className="mb-2 px-3 py-1 rounded text-xs font-semibold bg-purple-600 text-white"
                          onClick={() => handleFlipToggle(pokeman.id)}
                        >
                          Show Gigantamax
                        </button>
                        <div className="flex justify-center">
                          {pokeman.type.map((type, typeIndex) => (
                            <span
                              key={typeIndex}
                              className="text-sm font-medium mr-2 px-2.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: colors[type.toLowerCase()] }}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Gigantamax</span>
                          {pokeman.canDynamax && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Dynamax</span>
                          )}
                        </div>
                        <p className="capitalize text-gray-800 text-center sm:text-2xl text-lg mt-2">
                          <span className="font-bold mr-2">{pokeman.id}.</span>
                          {pokeman.name.english}
                        </p>
                      </div>
                      {/* Back of card (Gigantamax) */}
                      <div className="flip-card-back bg-purple-100 rounded p-4 flex flex-col items-center justify-center">
                        <img
                          src={gmaxImg}
                          alt="Gigantamax form"
                          width={120}
                          height={120}
                          className="mb-4 h-[152px] w-[152px] sm:h-[202px] sm:w-[202px] m-6"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          className="mb-2 px-3 py-1 rounded text-xs font-semibold bg-gray-400 text-white"
                          onClick={() => handleFlipToggle(pokeman.id)}
                        >
                          Back
                        </button>
                        <span className="text-purple-700 font-bold text-lg">Gigantamax Form</span>
                      </div>
                    </div>
                  </div>
                )
              } else {
                // Normal card for non-Gigantamax Pokémon
                return (
                  <div className="bg-gray-200 m-4 rounded p-4 flex flex-col items-center" key={pokeman.name.english}>
                    <Link href={"/pokemons/" + pokeman.id}>
                      <a>
                        <img
                          src={imgSrc}
                          alt=""
                          width={100}
                          height={100}
                          className="mb-4 h-[152px] w-[152px] sm:h-[202px] sm:w-[202px] m-6"
                          loading="lazy"
                        />
                      </a>
                    </Link>
                    <button
                      type="button"
                      className={`mb-2 px-3 py-1 rounded text-xs font-semibold ${isShiny ? 'bg-yellow-400 text-gray-900' : 'bg-gray-400 text-white'}`}
                      onClick={() => handleShinyToggle(pokeman.id)}
                    >
                      {isShiny ? 'Show Normal' : 'Show Shiny'}
                    </button>
                    <button
                      type="button"
                      className="mb-2 px-3 py-1 rounded text-xs font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                      disabled
                    >
                      Show Gigantamax
                    </button>
                    <div className="flex justify-center">
                      {pokeman.type.map((type, typeIndex) => (
                        <span
                          key={typeIndex}
                          className="text-sm font-medium mr-2 px-2.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: colors[type.toLowerCase()] }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {pokeman.canDynamax && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Dynamax</span>
                      )}
                    </div>
                    <p className="capitalize text-gray-800 text-center sm:text-2xl text-lg mt-2">
                      <span className="font-bold mr-2">{pokeman.id}.</span>
                      {pokeman.name.english}
                    </p>
                  </div>
                )
              }
            })
          )}
        </div>
        <div className="flex justify-between items-center pb-8 px-8">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mx-2 mb-2 focus:outline-none disabled:bg-gray-600"
            onClick={handlePrev}
            disabled={currentPage === 0 || isLoading}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mx-2 mb-2 focus:outline-none disabled:bg-gray-600"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1 || isLoading}
          >
            Next
          </button>
        </div>
      </Layout>
    </div>
  );
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
  };
}
