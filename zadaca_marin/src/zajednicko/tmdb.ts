export interface ZanrTmdb {
  id: number,
  name: string
}

export interface SerijeTmdb {
    page:number;
    results:Array<SerijaTmdb>;
    total_pages:number;
    total_results:number;
}

export interface SerijaTmdb {
    adult:boolean;
    backdrop_path:string;
    genre_ids:Array<number>;
    id:number;
    original_language:string;
    original_name:string;
    overview:string;
    popularity:number;
    poster_path:string;
    first_air_date:string;
    name:string;
    vote_average:number;
    vote_count:number;
}

export interface SerijaDetaljiTmdb {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    last_air_date: string;
    number_of_seasons: number;
    number_of_episodes: number;
    vote_average: number;
    vote_count: number;
    genres: Array<ZanrTmdb>;
    created_by: Array<{
        id: number;
        name: string;
        profile_path: string;
    }>;
    seasons: Array<{
        id: number;
        name: string;
        season_number: number;
        episode_count: number;
        air_date: string;
        poster_path: string;
        overview: string;
    }>;
}

export interface SlicneSerijeTmdb {
    page: number;
    results: Array<SerijaTmdb>;
    total_pages: number;
    total_results: number;
}

export interface VideoTmdb {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

