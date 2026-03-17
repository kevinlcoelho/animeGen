import { useEffect, useState } from 'react'

function AnimeList() {
  const [animes, setAnimes] = useState([])

  useEffect(() => {
    fetch('https://api.jikan.moe/v4/top/anime')
      .then((res) => res.json())
      .then((data) => setAnimes(data.data))
  }, [])

  return (
    <div>
      {animes.map((anime) => (
        <div key={anime.mal_id}>
          <h2>{anime.title}</h2>
          <img src={anime.images.jpg.image_url} width="200" />
          <p>Ano: {anime.year}</p>
          <p>Episódios: {anime.episodes}</p>
          <p>Nota: {anime.score}</p>
        </div>
      ))}
    </div>
  )
}
// teste 3
export default AnimeList
