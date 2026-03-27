import { useEffect, useState, useRef } from 'react'

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

  const generoIDS = {
    Ação: 1,
    Aventura: 2,
    'Boys Love': 28,
    Comédia: 4,
    Cotidiano: 36,
    Culinária: 47,
    Drama: 8,
    Ecchi: 9,
    Esportes: 30,
    Experimental: 5,
    Fantasia: 10,
    'Ficção Científica': 24,
    Mistério: 7,
    Premiados: 46,
    Romance: 22,
    Sobrenatural: 37,
    Suspense: 41,
    Terror: 14,
  }

  async function pegarAleatorios() {
    setLoading(true)
    const todasAsPaginas = []
    const idGenero = generoSelecionado ? generoIDS[generoSelecionado] : ''
    const baseUrl = idGenero
      ? `https://api.jikan.moe/v4/anime?genres=${idGenero}&order_by=score&sort=desc&type=tv`
      : `https://api.jikan.moe/v4/top/anime?type=tv`

    try {
      const paginasAlvo = new Set()
      while (paginasAlvo.size < 5) {
        paginasAlvo.add(Math.floor(Math.random() * 5) + 1)
      }

      for (const page of paginasAlvo) {
        const res = await fetch(`${baseUrl}&page=${page}`)

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
                {Object.keys(generoIDS).map((nomeGenero) => (
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
                        href={`https://www.google.com/search?q=${anime.title}+official-trailer-${anime.year}+youtube&btnI`}
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
