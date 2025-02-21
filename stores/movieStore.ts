// stores/movieStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

export const useMovieStore = defineStore('movie', () => {
  const movies = ref<any[]>([]);
  const page = ref(1);

  const fetchMovies = async () => {
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=${page.value}&sort_by=popularity.desc`;
    
    const options = {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`,
      }
    };

    try {
      const response = await axios.get(url, options);
      const uniqueMovies = response.data.results.filter((movie: any) => {
        return !movies.value.some((m) => m.id === movie.id);
      });
      movies.value.push(...uniqueMovies);
    } catch (error) {
      console.error('영화 데이터를 가져오는 데 실패했습니다:', error);
    }
  };

  return { movies, page, fetchMovies };
});
