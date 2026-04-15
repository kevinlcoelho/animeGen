import { useEffect, useState, useRef } from 'react'

const tradutorGeneros = {
  Action: 'Ação',
  Adventure: 'Aventura',
  Comedy: 'Comédia',
  Drama: 'Drama',
  Ecchi: 'Ecchi',
  Fantasy: 'Fantasia',
  Horror: 'Terror',
  Music: 'Música',
  Mystery: 'Mistério',
  Romance: 'Romance',
  'Sci-Fi': 'Ficção Científica',
  'Slice of Life': 'Cotidiano',
  Sports: 'Esportes',
  Supernatural: 'Sobrenatural',
  Suspense: 'Suspense',
  'Award Winning': 'Premiados',
  Gourmet: 'Culinária',
  'Avant Garde': 'Experimental',
}

function AnimeList() {
  const [animes, setAnimes] = useState([])
  const [loading, setLoading] = useState(false)
  const [generoSelecionado, setGeneroSelecionado] = useState('')
  const [aberto, setAberto] = useState(false)
  const gavetaRef = useRef(null)

  useEffect(() => {
    function manipularCliqueFora(event) {
      if (
        aberto &&
        gavetaRef.current &&
        !gavetaRef.current.contains(event.target)
      ) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', manipularCliqueFora)

    return () => {
      document.removeEventListener('mousedown', manipularCliqueFora)
    }
  }, [aberto])

  function embaralhar(array) {
    const novoArray = [...array]
    for (let i = novoArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]]
    }
    return novoArray
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const selecionarGenero = (nome) => {
    setGeneroSelecionado(nome)
    setAberto(false)
  }

  async function pegarAleatorios() {
    setLoading(true)
    const todasAsPaginas = []

    try {
      const paginasAlvo = new Set()
      while (paginasAlvo.size < 5) {
        paginasAlvo.add(Math.floor(Math.random() * 10) + 1)
      }

      for (const page of paginasAlvo) {
        const tradutorInverso = Object.fromEntries(
          Object.entries(tradutorGeneros).map(([en, pt]) => [pt, en]),
        )
        const generoEN = generoSelecionado
          ? tradutorInverso[generoSelecionado] || generoSelecionado
          : ''

        const query = `
          query {
            Page(page: ${page}, perPage: 25) {
              media(type: ANIME, format: TV, sort: SCORE_DESC${generoEN ? `, genre_in: ["${generoEN}"]` : ''}) {
                id
                title { romaji native }
                coverImage { large }
                startDate { year }
                episodes
                averageScore
                genres
                trailer { id site thumbnail }
              }
            }
          }
        `

        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        const json = await res.json()
        const animesAnilist = json.data?.Page?.media || []

        const convertidos = animesAnilist.map((a) => ({
          mal_id: a.id,
          title: a.title.romaji,
          title_japanese: a.title.native,
          images: { jpg: { image_url: a.coverImage.large } },
          year: a.startDate?.year,
          episodes: a.episodes,
          score: a.averageScore
            ? Number((a.averageScore / 10).toFixed(1))
            : null,
          genres: (a.genres || []).map((name) => ({ name })),
          trailer: a.trailer?.id
            ? `https://www.youtube.com/watch?v=${a.trailer.id}`
            : null,
        }))

        if (convertidos.length) {
          todasAsPaginas.push(...convertidos)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="pagina-centralizada">
      <div className="painel-principal">
        <div className="assinatura">
          <span className="by">Developed by</span>
          <span className="nome">Kevin Coelho</span>
        </div>
        <div className="topo-painel">
          <h1>Anime Insight</h1>
          <button
            onClick={pegarAleatorios}
            disabled={loading}
            className={`botao-gerar ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <div className="dots-container">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            ) : (
              'Gerar novos animes'
            )}
          </button>
          <div className="seletor-container" ref={gavetaRef}>
            <div className="gaveta-wrapper">
              <div
                className={`gaveta-header ${aberto ? 'ativo' : ''}`}
                onClick={() => setAberto(!aberto)}
              >
                <p className="texto-genero-atual">
                  {generoSelecionado || 'Todos os Gêneros'}
                </p>

                <i className={`seta-icone ${aberto ? 'girar' : ''}`}>▼</i>
              </div>

              <ul className={`gaveta-lista ${aberto ? 'expandida' : ''}`}>
                <li onClick={() => selecionarGenero('')}>Todos os Gêneros</li>
                {Object.values(tradutorGeneros).map((nomeGenero) => (
                  <li
                    key={nomeGenero}
                    onClick={() => selecionarGenero(nomeGenero)}
                  >
                    {nomeGenero}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="containerAnime">
          {(loading ? Array(6).fill(null) : animes).map((anime, index) => (
            <div
              key={anime?.mal_id || `skeleton-${index}`}
              className="cardAnime"
            >
              {loading ? (
                <>
                  <h3>
                    <div className="skeleton-title-wrapper">
                      <div className="skeleton-loading skeleton-title-en"></div>
                      <div className="skeleton-loading skeleton-title-jp"></div>
                    </div>
                  </h3>
                  <div className="skeleton-loading skeleton-img-placeholder"></div>
                  <div className="info-content">
                    <div className="stats-row">
                      <div className="stat-item">
                        <span className="emoji">📅</span>
                        <div
                          className="skeleton-loading skeleton-data skeleton-w-ano"
                          style={{ width: '35px', height: '14px' }}
                        ></div>
                      </div>
                      <div className="stat-item">
                        <span className="emoji">🎞️</span>
                        <div
                          className="skeleton-loading skeleton-data skeleton-w-episodios"
                          style={{ width: '25px', height: '14px' }}
                        ></div>
                      </div>
                      <div className="stat-item">
                        <span className="rank-estrela">⭐</span>
                        <div
                          className="skeleton-loading skeleton-data skeleton-w-rank"
                          style={{ width: '35px', height: '14px' }}
                        ></div>
                      </div>
                    </div>
                    <div className="genero-container">
                      <span className="genero-label">🎭</span>
                      <div
                        className="skeleton-loading skeleton-data skeleton-w-genero"
                        style={{ width: '100%', height: '16px' }}
                      ></div>
                    </div>
                    <div className="links-container">
                      <button
                        type="button"
                        className="btn-trailer"
                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        disabled
                      >
                        🎥 Trailer
                      </button>
                      <div className="btn-op-ed-container">
                        <button
                          type="button"
                          className="btn-op"
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          disabled
                        >
                          🎶 Opening
                        </button>
                        <button
                          type="button"
                          className="btn-ed"
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          disabled
                        >
                          🎵 Ending
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3>
                    <span className="titulo-en">{anime.title}</span>
                    {anime.title_japanese && (
                      <span className="titulo-jp">{anime.title_japanese}</span>
                    )}
                  </h3>
                  <a
                    href={`https://www.google.com/search?q=${anime.title}+official-trailer-${anime.year}+youtube&btnI`}
                    target="_blank"
                    rel="noreferrer"
                    draggable="false"
                  >
                    <img
                      className="skeleton-img-placeholder"
                      src={anime.images?.jpg?.image_url}
                      alt={anime.title}
                      draggable="false"
                    />
                  </a>
                  <div className="info-content">
                    <div className="stats-row">
                      <div className="stat-item">
                        <span className="emoji">📅</span>
                        <span className="valor">{anime.year || 'N/A'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="emoji">🎞️</span>
                        <span className="valor">{anime.episodes || '?'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="rank-estrela">⭐</span>
                        <span className="valor">
                          {anime.score
                            ? Number.isInteger(anime.score)
                              ? `${anime.score}.0`
                              : anime.score
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="genero-container">
                      <span className="genero-label">🎭</span>
                      <p>
                        {anime.genres
                          ?.map((g) => tradutorGeneros[g.name] || g.name)
                          .join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="links-container">
                      <a
                        href={
                          anime.trailer ||
                          `https://www.google.com/search?q=${anime.title}+official-trailer-${anime.year}+youtube&btnI`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="btn-trailer"
                      >
                        🎥 Trailer
                      </a>
                      <div className="btn-op-ed-container">
                        <a
                          href={`https://www.google.com/search?q=${anime.title}+opening+tv+size+${anime.year}+youtube&btnI`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-op"
                        >
                          🎶 Opening
                        </a>
                        <a
                          href={`https://www.google.com/search?q=${anime.title}+ending+tv+size+${anime.year}+youtube&btnI`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ed"
                        >
                          🎵 Ending
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnimeList
