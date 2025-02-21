<template>
    <div class="body">
    <h1>인기 영화 목록</h1>
    <ul>
      <li v-for="movie in movies" :key="movie.id">
        <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title" />
        <div>
          <h2>{{ movie.title }}</h2>
          <div id="rating">
            <span>평점: 4.5</span>
            <div id="like-container">
              <span id="like-text">좋아요</span>
              <img 
                :id="`like-button-${movie.id}`" 
                :src="movie.liked ? '/heart_active.png' : '/heart_inactive.png'" 
                @click="toggleLike(movie.id)" 
                alt="좋아요 버튼" 
                style="cursor: pointer;"
              />
            </div>
          </div>
        </div>
      </li>
    </ul>
    <button class="scroll-to-top" @click="scrollToTop">↑</button>
  </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { Movie } from '../models/Movie';
  import axios from 'axios';  
  
  const movies = ref<any[]>([]);
  const page = ref(1);

  // 쿠키 설정 함수
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

// 쿠키 가져오기 함수
function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

// 좋아요 버튼 상태 설정
const likeButton = ref<HTMLSpanElement | null>(null);
const liked = getCookie('liked');

const toggleLike = (movieId: number) => {
  console.log('toggleLike 함수 호출됨'); // 함수 호출 확인 로그 추가
  const movie = movies.value.find(m => m.id === movieId);

  if (movie) {
    movie.liked = !movie.liked; // 좋아요 상태 토글
    setCookie(`liked-${movieId}`, movie.liked.toString(), 7); // 쿠키에 상태 저장
    console.log(`하트 버튼 클릭됨. 영화 ID: ${movieId}, 현재 상태: ${movie.liked ? '좋아요' : '좋아요 취소'}`);

    // UI 즉각 업데이트
    const likeButton = document.getElementById(`like-button-${movieId}`) as HTMLImageElement; ;
    if (likeButton) {
      likeButton.src = movie.liked ? '/heart_active.png' : '/heart_inactive.png'; // 이미지 즉시 변경
    }
  } else {
    console.log(`영화 ID ${movieId}를 찾을 수 없습니다.`);
  }
};


  console.log('API Key:', process.env.API_KEY);
  
  const fetchMovies = async () => {
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=${page.value}&sort_by=popularity.desc`;
    console.log('API Key:', process.env.API_KEY);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        // Authorization: `Bearer ${process.env.API_KEY}`,
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NDQwZGQzY2Y4OWE4NmNhYWZiMjg5MDgxYjBjYjIwNiIsIm5iZiI6MTY2OTAwNDgxOS4yNzcsInN1YiI6IjYzN2FmZTEzMTU2Y2M3MDA4MjE4ZjZlYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Zfn2qzLNokOZjVreA6cNJh-Sa71pVvrDwkWuvrGwFCQ`,
      }
    };
  
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // 중복된 영화 제거
      const uniqueMovies = data.results.filter((movie: Movie) => {
        return !movies.value.some((m) => m.id === movie.id);
      });
      movies.value.push(...uniqueMovies); // 중복되지 않은 영화만 추가
    } catch (error) {
      console.error('영화 데이터를 가져오는 데 실패했습니다:', error);
    }
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 페이지의 아래쪽에 도달했는지 확인
    if (scrollY + windowHeight >= documentHeight - 100) {
      page.value += 1;
      fetchMovies();
    }
  }
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMounted(() => {
    fetchMovies();
    window.addEventListener('scroll', handleScroll);  // 스크롤 이벤트 리스너 추가

    movies.value.forEach(movie => {
      if (getCookie(`liked-${movie.id}`) === 'true') {
        movie.liked = true; // 쿠키에서 상태 가져오기
      }
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll); // 컴포넌트 언마운트 시 이벤트 리스너 제거
    movies.value.forEach(movie => {
      const likeButton = document.getElementById(`like-button-${movie.id}`);
      if (likeButton && movie.handleClick) {
        likeButton.removeEventListener('click', movie.handleClick); // 클릭 이벤트 리스너 제거
      }
    });
  });
  
</script>

<style scoped>
.body {
  background-color: #121212; /* 어두운 배경 색 */
  color: #ffffff; /* 밝은 글씨 색 */
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

img {
  width: 150px; /* 포스터 이미지의 너비 */
  height: auto; /* 비율 유지 */
  margin-right: 20px; /* 이미지와 텍스트 간의 간격 */
}

h2 {
  margin: 0; /* 제목의 기본 마진 제거 */
}

p {
  margin: 0; /* 평점의 기본 마진 제거 */
}

#like-container {
  display: flex;
  align-items: center;  /* 수직 정렬 */
}

#like-container img {
  width: 24px; /* 하트 아이콘의 너비 */
  height: 24px; /* 하트 아이콘의 높이 */
  cursor: pointer; /* 커서 스타일 */
}

#like-text {
  margin-right: 8px;  /* 하트와 텍스트 간격 조정 */
  font-size: 18px;  /* 텍스트 크기 조정 */
}

.like-button.active {
  background-image: url('/heart_active.png'); /* 활성화된 상태의 이미지 */
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff4081; /* 버튼 배경 색 */
  color: white; /* 버튼 글씨 색 */
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  
}

</style>
    