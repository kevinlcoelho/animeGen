import { useEffect, useState } from 'react'

const tradutorGeneros = {
  Action: 'Ação',
  Adventure: 'Aventura',
  Comedy: 'Comédia',
  Drama: 'Drama',
  Fantasy: 'Fantasia',
  Horror: 'Terror',
  Mystery: 'Mistério',
  Romance: 'Romance',
  'Sci-Fi': 'Ficção Científica',
  'Slice of Life': 'Cotidiano',
  Sports: 'Esportes',
  Supernatural: 'Sobrenatural',
  Suspense: 'Suspense',
  'Award Winning': 'Premiados',
  Gourmet: 'Culinária',
  Ecchi: 'Echi',
  'Avant Garde': 'Experimental',
  'Boys Love': 'Boys Love',
  'Girls Love': 'Girls Love',
}

function AnimeList() {
  const [animes, setAnimes] = useState([])
  const [loading, setLoading] = useState(false)

  function embaralhar(array) {
    const novoArray = [...array]
    for (let i = novoArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]]
    }
    return novoArray
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  async function pegarAleatorios() {
    setLoading(true)
    const todasAsPaginas = []

    try {
      const paginasAlvo = new Set()
      while (paginasAlvo.size < 5) {
        paginasAlvo.add(Math.floor(Math.random() * 40) + 1)
      }

      for (const page of paginasAlvo) {
        const res = await fetch(
          `https://api.jikan.moe/v4/top/anime?page=${page}&type=tv`,
        )

        if (res.status === 429) {
          await sleep(1000)
          continue
        }

        const dados = await res.json()
        if (dados.data) {
          todasAsPaginas.push(...dados.data)
        }

        await sleep(350)
      }

      const idsUnicos = new Set()
      const listaLimpa = todasAsPaginas.filter((anime) => {
        if (idsUnicos.has(anime.mal_id)) return false
        idsUnicos.add(anime.mal_id)
        return true
      })

      const misturados = embaralhar(listaLimpa)
      setAnimes(misturados.slice(0, 6))
    } catch (erro) {
      console.error('Erro na busca:', erro)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    pegarAleatorios()
  }, [])

  return (
    <div>
      <button onClick={pegarAleatorios} disabled={loading}>
        {loading ? 'Carregando...' : 'Gerar novos animes'}
      </button>

      <div>
        {animes.map((anime) => (
          <div key={anime.mal_id}>
            <h3>{anime.title}</h3>

            <img
              src={anime.images?.jpg?.image_url}
              alt={anime.title}
              width="200"
            />

            <p>Ano: {anime.year || 'N/A'}</p>
            <p>Episodios: {anime.episodes || '?'}</p>
            <p>Nota: {anime.score || 'Sem nota'}</p>

            <p>
              Generos:{' '}
              {anime.genres
                ?.map((g) => tradutorGeneros[g.name] || g.name)
                .join(', ') || 'N/A'}
            </p>

            <hr />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnimeList
