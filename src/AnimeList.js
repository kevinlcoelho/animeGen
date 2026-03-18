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
  Ecchi: 'Ecchi',
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
    <div className="pagina-centralizada">
      <div className="painel-principal">
        <div className="topo-painel">
          <h1>Anime Indicator</h1>
          <button
            onClick={pegarAleatorios}
            disabled={loading}
            className="botao-gerar"
          >
            {loading ? 'Carregando...' : 'Gerar novos animes'}
          </button>
        </div>

        <div className="containerAnime">
          {animes.map((anime) => (
            <div key={anime.mal_id} className="cardAnime">
              <h3>
                <span className="titulo-en">{anime.title}</span>
                {anime.title_japanese && (
                  <span className="titulo-jp">{anime.title_japanese}</span>
                )}
              </h3>

              <img
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
                width="200"
              />
              <p>
                📅<span>Ano</span>: {anime.year || 'N/A'}
              </p>
              <p>
                🎞️<span>Episódios</span>: {anime.episodes || '?'}
              </p>
              <p>
                ⭐<span>Rank</span>: {anime.score || 'Sem nota'}
              </p>

              <p>
                🎭<span>Genêro</span>:{' '}
                {anime.genres
                  ?.map((g) => tradutorGeneros[g.name] || g.name)
                  .join(', ') || 'N/A'}
              </p>

              <p>
                🎥<span>Trailer</span>:{' '}
                {anime.trailer?.url ? (
                  <a href={anime.trailer.url} target="_blank" rel="noreferrer">
                    ▶️ Assistir Trailer
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/search?q=${anime.title}+trailer-original+youtube&btnI`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Assistir
                  </a>
                )}
              </p>
              <p>
                🎶<span>Opening</span>:{' '}
                {anime.trailer?.url ? (
                  <a href={anime.trailer.url} target="_blank" rel="noreferrer">
                    ▶️ Assistir Opening
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/search?q=${anime.title}+opening-original+youtube&btnI`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvir
                  </a>
                )}
              </p>
              <p>
                🎵<span>Ending</span>:{' '}
                {anime.trailer?.url ? (
                  <a href={anime.trailer.url} target="_blank" rel="noreferrer">
                    ▶️ Assistir Ending
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/search?q=${anime.title}+ending-original+youtube&btnI`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvir
                  </a>
                )}
              </p>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnimeList
